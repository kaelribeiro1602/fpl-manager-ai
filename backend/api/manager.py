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
