from fastapi import APIRouter, HTTPException
import httpx
from typing import Any, Dict

router = APIRouter()

FPL_API_BASE = "https://fantasy.premierleague.com/api"

@router.get("/api/manager/{manager_id}")
async def get_manager_details(manager_id: int) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/entry/{manager_id}/")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Manager not found")
            raise HTTPException(status_code=500, detail=f"FPL API Error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/api/manager/{manager_id}/history")
async def get_manager_history(manager_id: int) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/entry/{manager_id}/history/")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
             if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Manager history not found")
             raise HTTPException(status_code=500, detail=f"FPL API Error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/api/manager/{manager_id}/gameweek/{event_id}")
async def get_manager_gameweek(manager_id: int, event_id: int) -> Dict[str, Any]:
    """Fetch specific gameweek picks for a manager."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/entry/{manager_id}/event/{event_id}/picks/")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching GW picks: {str(e)}")

@router.get("/api/bootstrap")
async def get_bootstrap_static() -> Dict[str, Any]:
    """Fetch general FPL data (players, teams, etc.)."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/bootstrap-static/")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching bootstrap data: {str(e)}")

@router.get("/api/manager/{manager_id}/gameweek/{event_id}/transfers")
async def get_manager_gw_transfers(manager_id: int, event_id: int) -> Any:
    """Fetch transfers for a specific gameweek."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/entry/{manager_id}/transfers/")
            response.raise_for_status()
            all_transfers = response.json()
            # Filter for the specific event (GW)
            gw_transfers = [t for t in all_transfers if t["event"] == event_id]
            return gw_transfers
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching transfers: {str(e)}")

@router.get("/api/fixtures")
async def get_fixtures() -> Any:
    """Fetch upcoming fixtures."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{FPL_API_BASE}/fixtures/")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching fixtures: {str(e)}")
