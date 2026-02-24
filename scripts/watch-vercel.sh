#!/bin/bash
# scripts/watch-vercel.sh
# Usage: ./scripts/watch-vercel.sh <project-id>

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is not set."
  exit 1
fi

PROJECT_ID=$1
echo "Fetching latest deployment for project: $PROJECT_ID..."

# Get the latest deployment for the project
DEPLOYMENT=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1")

URL=$(echo $DEPLOYMENT | jq -r '.deployments[0].url')
STATE=$(echo $DEPLOYMENT | jq -r '.deployments[0].state')

echo "Latest Deployment: https://$URL"
echo "Current State: $STATE"

if [ "$STATE" == "READY" ]; then
  echo "Deployment is LIVE. Running health check..."
  curl -I "https://$URL/health"
else
  echo "Deployment is not ready yet."
fi
