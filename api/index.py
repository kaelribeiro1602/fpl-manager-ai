from fastapi import FastAPI
import httpx
import logging

# Simple direct client logic for Vercel
app = FastAPI()

FPL_BASE_URL = "https://fantasy.premierleague.com/api"

class FPLClient:
    def __init__(self):
        self.client = httpx.Client(
            base_url=FPL_BASE_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                "Origin": "https://fantasy.premierleague.com",
                "Referer": "https://fantasy.premierleague.com/"
            },
            follow_redirects=True
        )

    def get_bootstrap_static(self):
        response = self.client.get("/bootstrap-static/")
        response.raise_for_status()
        return response.json()

@app.get("/api/py/health")
async def health():
    return {"status": "ok", "service": "fpl-ai-backend"}

@app.get("/api/py/bootstrap")
async def get_bootstrap():
    client = FPLClient()
    try:
        data = client.get_bootstrap_static()
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
