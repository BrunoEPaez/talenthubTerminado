# 1. Imagen oficial de Ruby
FROM ruby:3.3.0

# 2. Instalamos dependencias del sistema (libpq-dev es clave para PostgreSQL)
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# 3. Directorio de trabajo
WORKDIR /app

# 4. Copiamos gemas
COPY Gemfile Gemfile.lock ./
RUN bundle install

# 5. Copiamos el código
COPY . .

# 6. Permisos para los binarios de Rails
RUN chmod +x bin/*

# 7. Preparamos el script de entrada (Entrypoint)
# Este script correrá las migraciones automáticamente
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# 8. Variables de entorno
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true
ENV PORT=3000

EXPOSE 3000

# 9. Comando final: Solo arrancar el servidor
# Las migraciones se encargan en el entrypoint
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]