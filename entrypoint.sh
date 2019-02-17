#!/usr/bin/env bash

if [ "$*" == "" ]; then
    python -m backend "${BACKEND_PORT:-5000}"
else
    exec "$@"
fi
