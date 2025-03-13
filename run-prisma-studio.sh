#!/bin/bash

# This script starts Prisma Studio in the server container using port 5556
# Use this script instead of running Prisma Studio directly to avoid port conflicts

echo "Starting Prisma Studio in server container on port 5556..."
echo "Open your browser to http://localhost:5556 to access Prisma Studio"
echo "Press Ctrl+C to stop Prisma Studio"

docker exec -it server bash -c "npx prisma studio --port 5556" 