#!/usr/bin/env bash
set -e
cd "$(dirname -- "$(readlink -f -- "$0")")"

SERVICE_NAME="$1"
shift
CONTAINER_ID="$(docker ps --filter "label=com.docker.compose.project=vlsu" --filter "label=com.docker.compose.service=$SERVICE_NAME" --format "{{.ID}}")"
if [[ -z $CONTAINER_ID ]]
then
    echo "Container for '$SERVICE_NAME' not found"
    exit 1
fi

if (( $# == 0 ))
then
    SERVICE_CMD=( bash )
else
    SERVICE_CMD=( "$@" )
fi

docker exec -it "$CONTAINER_ID" "${SERVICE_CMD[@]}"
