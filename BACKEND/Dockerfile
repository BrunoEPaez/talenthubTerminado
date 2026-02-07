# 1. Usamos Ruby 3.4.1 (Necesario para Rails 8.1+)
FROM ruby:3.4.1

# 2. Instalamos dependencias del sistema
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# 3. Directorio de trabajo
WORKDIR /app

# 4. Copiamos gemas primero para aprovechar la caché de Docker
COPY Gemfile Gemfile.lock ./
RUN bundle install

# 5. Copiamos el resto del código
COPY . .

# 6. Permisos para los binarios de Rails
RUN chmod +x bin/*

# 7. Variables de entorno de producción
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true
ENV PORT=3000

# 8. Exponer el puerto
EXPOSE 3000

# 9. COMANDO MAESTRO:
# Primero corre las migraciones. Si tienen éxito, arranca el servidor.
# Hemos quitado el ENTRYPOINT para que este comando sea el único dueño del inicio.
CMD ["sh", "-c", "bundle exec rails db:migrate && bundle exec rails server -b 0.0.0.0 -p 3000"]