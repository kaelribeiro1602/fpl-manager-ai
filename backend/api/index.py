from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from .manager import router as manager_router
from .ai import router as ai_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(manager_router)
app.include_router(ai_router)

FPL_BASE_URL = "https://fantasy.premierleague.com/api"

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fpl-ai-backend"}

@app.get("/bootstrap")
async def get_bootstrap():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{FPL_BASE_URL}/bootstrap-static/",
                headers={"User-Agent": "Mozilla/5.0"}
            )
            return {"success": True, "data": response.json()}
        except Exception as e:
            return {"success": False, "error": str(e)}
