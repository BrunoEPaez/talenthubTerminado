#!/bin/bash
set -e

# Eliminar un servidor que haya quedado colgado (común en Docker)
if [ -f /app/tmp/pids/server.pid ]; then
  rm /app/tmp/pids/server.pid
fi

# Intentar correr migraciones
echo "Revisando base de datos..."
bundle exec rails db:migrate || {
  echo "La migración falló. Intentando crear base de datos primero..."
  bundle exec rails db:setup
}

# Ejecuta el comando que viene del CMD del Dockerfile
exec "$@"