#!/bin/bash
set -e

# Limpiar PIDs antiguos
if [ -f /app/tmp/pids/server.pid ]; then
  rm /app/tmp/pids/server.pid
fi

# Correr migraciones o configurar base si está vacía
echo "Configurando base de datos..."
bundle exec rails db:migrate || bundle exec rails db:setup

# Iniciar el proceso principal
exec "$@"