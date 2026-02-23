from fastapi import FastAPI
import sys
import os
import httpx

# Add the backend/src directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend", "src"))

from fpl_ai.client import FPLClient

app = FastAPI()

# Note: We can migrate the core FPLClient to async later if needed,
# but for the serverless functions, we use an async client for the request handling.

@app.get("/api/py/health")
async def health():
    return {"status": "ok", "service": "fpl-ai-backend"}

@app.get("/api/py/bootstrap")
async def get_bootstrap():
    client = FPLClient()
    # While the core client is sync, FastAPI handles sync routes in a threadpool.
    # We'll keep it as 'async def' to ensure we're ready for full async migration.
    try:
        data = client.get_bootstrap_static()
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/py/manager/{manager_id}")
async def get_manager(manager_id: int):
    client = FPLClient()
    try:
        data = client.get_manager_data(manager_id)
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
