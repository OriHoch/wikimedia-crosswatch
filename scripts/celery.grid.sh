#!/bin/bash
if [[ -z "${CROSSWATCH_CELERY_BIN}" ]]; then
    venv=$HOME/.virtualenvs/backend/bin
    source ${venv}/activate
    cd `dirname $0`
    CROSSWATCH_CELERY_BIN="${venv}/celery"
fi
${CROSSWATCH_CELERY_BIN} -A backend worker -l info -n crosswatch$1.%n --concurrency=500 -P gevent
