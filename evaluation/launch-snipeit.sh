#!/usr/bin/env bash
# Launch the Snipe-IT verification stack (podman). Idempotent-ish.
set -e
NET=snipeit-net
podman network create "$NET" 2>/dev/null || true

if ! podman container exists snipe-mysql; then
  podman run -d --name snipe-mysql --network "$NET" \
    -e MYSQL_ROOT_PASSWORD=snipe-root -e MYSQL_DATABASE=snipeit \
    -e MYSQL_USER=snipe -e MYSQL_PASSWORD=snipe-pass \
    docker.io/library/mariadb:10.11
fi

APP_KEY="base64:$(head -c 32 /dev/urandom | base64 -w0)"
if ! podman container exists snipe-app; then
  podman run -d --name snipe-app --network "$NET" -p 8010:80 \
    -e APP_ENV=production -e APP_DEBUG=false -e APP_KEY="$APP_KEY" \
    -e APP_URL=http://localhost:8010 -e APP_TIMEZONE=Africa/Lusaka -e APP_LOCALE=en \
    -e MYSQL_PORT_3306_TCP_ADDR=snipe-mysql -e MYSQL_DATABASE=snipeit \
    -e MYSQL_USER=snipe -e MYSQL_PASSWORD=snipe-pass \
    -e MAIL_MAILER=log \
    docker.io/snipe/snipe-it:latest
fi

echo "waiting for app..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null -m 3 http://localhost:8010/login; then
    echo "UP: http://localhost:8010 (setup: /setup)"
    exit 0
  fi
  sleep 3
done
echo "app did not come up in 180s — check: podman logs snipe-app"
exit 1
