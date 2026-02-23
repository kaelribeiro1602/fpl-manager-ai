import argparse
import sys
from fpl_ai.client import FPLClient

def main():
    parser = argparse.ArgumentParser(description="FPL Manager AI CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Bootstrap command
    subparsers.add_parser("bootstrap", help="Fetch general FPL static data (players, teams, etc.)")

    # Manager command
    manager_parser = subparsers.add_parser("manager", help="Fetch manager-specific data")
    manager_parser.add_argument("id", type=int, help="The FPL Manager ID")

    args = parser.parse_args()
    client = FPLClient()

    try:
        if args.command == "bootstrap":
            data = client.get_bootstrap_static()
            print(f"✅ Success: Found {len(data['elements'])} players and {len(data['teams'])} teams.")
        
        elif args.command == "manager":
            data = client.get_manager_data(args.id)
            print(f"✅ Success: Found manager '{data['player_first_name']} {data['player_last_name']}' - Team: {data['name']}")
        
        else:
            parser.print_help()

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
