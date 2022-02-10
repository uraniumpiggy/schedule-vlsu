#!/usr/bin/env bash
set -e
cd "$(dirname -- "$(readlink -f -- "$0")")"

echo "Building images..."
docker-compose build

echo "Stopping previous services..."
docker-compose stop

echo "Removing previous containers..."
docker container prune --force --filter 'label=com.docker.compose.project=vlsu' > /dev/null

echo "Starting the services..."
docker-compose up
