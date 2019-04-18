#!/usr/bin/env bash

if [ "$*" == "" ]; then
    BASE_SCHEME="${BASE_SCHEME:-http}"
    BASE_HOST="${BASE_HOST:-localhost:5000}"
    sed -i 's/https:\/\/tools.wmflabs.org\/crosswatch/'${BASE_SCHEME}':\/\/'${BASE_HOST}'\/crosswatch/' /usr/src/backend/server/public/crosswatch/scripts/app-c1407f44.js
    cp /usr/src/backend/config.py.docker /usr/src/backend/config.py
    sed -i "s/__TOOL_NAME__/${TOOL_NAME}/" /usr/src/backend/config.py
    sed -i "s/__MAIL_SERVER__/${MAIL_SERVER}/" /usr/src/backend/config.py
    sed -i "s/__EMAIL__/${EMAIL}/" /usr/src/backend/config.py
    sed -i "s/__REDIS_SERVER__/${REDIS_SERVER}/" /usr/src/backend/config.py
    sed -i "s/__REDIS_PORT__/${REDIS_PORT}/" /usr/src/backend/config.py
    sed -i "s/__REDIS_DB__/${REDIS_DB}/" /usr/src/backend/config.py
    sed -i "s/__REDIS_PREFIX__/${REDIS_PREFIX}/" /usr/src/backend/config.py
    sed -i "s/__SQL_HOST__/${SQL_HOST}/" /usr/src/backend/config.py
    sed -i "s/__SQL_Used__/${SQL_USER}/" /usr/src/backend/config.py
    sed -i "s/__SQL_PASSWORD__/${SQL_PASSWORD}/" /usr/src/backend/config.py
    sed -i "s/__OAUTH_CONSUMER_KEY__/${OAUTH_CONSUMER_KEY}/" /usr/src/backend/config.py
    sed -i "s/__OAUTH_CONSUMER_SECRET__/${OAUTH_CONSUMER_SECRET}/" /usr/src/backend/config.py
    supervisord -c /usr/src/supervisord.conf
    sleep 2
    tail -f /var/log/supervisord.log &
    tail -f /var/log/supervisord/* &
    exec python -m backend "${BACKEND_PORT:-5000}" "$@"
else
    exec "$@"
fi
