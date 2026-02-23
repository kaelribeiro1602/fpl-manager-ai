import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        """Fetch general information (players, teams, gameweeks)."""
        logger.info("Fetching bootstrap-static data...")
        response = self.client.get("/bootstrap-static/")
        response.raise_for_status()
        return response.json()

    def get_manager_data(self, manager_id: int):
        """Fetch manager-specific details."""
        logger.info(f"Fetching data for manager {manager_id}...")
        response = self.client.get(f"/entry/{manager_id}/")
        response.raise_for_status()
        return response.json()

if __name__ == "__main__":
    # Quick connectivity test
    client = FPLClient()
    try:
        data = client.get_bootstrap_static()
        print(f"Success! Found {len(data['elements'])} players.")
    except Exception as e:
        print(f"API Error: {e}")
