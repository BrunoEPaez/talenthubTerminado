#!/bin/bash
set -e

# Borrar PIDs de sesiones anteriores
if [ -f /app/tmp/pids/server.pid ]; then
  rm /app/tmp/pids/server.pid
fi

# Intentar preparar la base de datos (Migrar o Crear si no existe)
echo "== Preparando la base de datos =="
bundle exec rails db:prepare

# Si tienes datos iniciales (opcional)
# bundle exec rails db:seed 

echo "== Base de datos lista. Arrancando servidor... =="

# Ejecuta el comando principal (el CMD del Dockerfile)
exec "$@"