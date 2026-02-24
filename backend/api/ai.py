import os
import httpx
import json
import asyncio
from fastapi import APIRouter, HTTPException
from typing import Any, Dict
from agno.agent import Agent
from agno.models.google import Gemini

router = APIRouter()

FPL_API_BASE = "https://fantasy.premierleague.com/api"

@router.get("/api/recommend-transfer/{manager_id}")
async def recommend_transfer(manager_id: int) -> Dict[str, Any]:
    """Uses Agno + Gemini to suggest a transfer based on team and fixtures."""
    
    gemini_api_key = os.getenv("GOOGLE_API_KEY")
    if not gemini_api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not configured")

    async with httpx.AsyncClient() as client:
        try:
            # 1. Fetch data in parallel
            picks_task = client.get(f"{FPL_API_BASE}/entry/{manager_id}/event/27/picks/") # Hardcoded GW27 for now or fetch latest
            bootstrap_task = client.get(f"{FPL_API_BASE}/bootstrap-static/")
            fixtures_task = client.get(f"{FPL_API_BASE}/fixtures/")
            
            responses = await asyncio.gather(picks_task, bootstrap_task, fixtures_task)
            for r in responses:
                r.raise_for_status()
            
            picks_data = responses[0].json()
            bootstrap_data = responses[1].json()
            fixtures_data = responses[2].json()

            # 2. Prepare Context for AI
            # Map players
            players = {p['id']: p for p in bootstrap_data['elements']}
            teams = {t['id']: t for t in bootstrap_data['teams']}
            
            current_squad = []
            for p in picks_data['picks']:
                player = players[p['element']]
                current_squad.append({
                    "name": player['web_name'],
                    "team": teams[player['team']]['name'],
                    "position": player['element_type'],
                    "form": player['form'],
                    "points": player['event_points'],
                    "cost": player['now_cost'] / 10
                })

            # Get some high form players (potential targets)
            targets = sorted(
                [p for p in bootstrap_data['elements'] if float(p['form']) > 5],
                key=lambda x: float(x['form']),
                reverse=True
            )[:15]
            
            potential_in = [{
                "name": p['web_name'],
                "team": teams[p['team']]['name'],
                "form": p['form'],
                "cost": p['now_cost'] / 10
            } for p in targets]

            # 3. Use Agno Agent
            agent = Agent(
                model=Gemini(id="gemini-2.0-flash-exp"),
                description="You are an expert Fantasy Premier League (FPL) strategist.",
                instructions=[
                    "Analyze the manager's current squad.",
                    "Identify the weakest link (low form, bad fixtures).",
                    "Suggest one high-value transfer-in from the potential targets.",
                    "The transfer must be for a player in the same position.",
                    "Explain your reasoning clearly including form and fixture vibes.",
                    "Return a JSON object with keys: 'player_out', 'player_in', 'reasoning'."
                ],
                markdown=True
            )

            prompt = f"""
            Manager's Current Squad: {json.dumps(current_squad)}
            Potential Transfer Targets: {json.dumps(potential_in)}
            
            Based on this, suggest the best single transfer. 
            Format the response as a JSON block.
            """
            
            response = agent.run(prompt)
            # The agent output might contain markdown, we need the JSON
            # In a production app we'd use response_model, but for speed:
            content = response.content
            # Simple extractor for JSON if needed, or just return content
            return {"recommendation": content}

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Suggestion Error: {str(e)}")
