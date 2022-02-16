#!/usr/bin/env bash
set -e
cd "$(dirname -- "$(readlink -f -- "$0")")"

./exec.sh api ./node_modules/.bin/mm $*
