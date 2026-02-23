from curl_cffi import requests

def test_fpl():
    url = "https://fantasy.premierleague.com/api/bootstrap-static/"
    try:
        response = requests.get(url, impersonate="chrome120")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {len(data.get('elements', []))} players.")
        else:
            print(f"Failed with status: {response.status_code}")
            print(response.text[:200])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_fpl()
