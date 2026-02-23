from fastapi import FastAPI
import sys
import os

# Add the backend/src directory to sys.path so we can import our core logic
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend", "src"))

from fpl_ai.client import FPLClient

app = FastAPI()

@app.get("/api/py/health")
def health():
    return {"status": "ok", "service": "fpl-ai-backend"}

@app.get("/api/py/bootstrap")
def get_bootstrap():
    client = FPLClient()
    try:
        data = client.get_bootstrap_static()
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/py/manager/{manager_id}")
def get_manager(manager_id: int):
    client = FPLClient()
    try:
        data = client.get_manager_data(manager_id)
        return {"success": True, "data": data}
    except Exception as e:
        return {"success": False, "error": str(e)}
