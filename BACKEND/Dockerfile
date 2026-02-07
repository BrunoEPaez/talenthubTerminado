# 1. Usamos Ruby 3.4.1 para total compatibilidad con Rails 8.1+
FROM ruby:3.4.1

# 2. Instalamos dependencias del sistema
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# 3. Directorio de trabajo
WORKDIR /app

# 4. Copiamos Gemfile y lock
COPY Gemfile Gemfile.lock ./

# 5. Instalamos las gemas
RUN bundle install

# 6. Copiamos el resto del código
COPY . .

# 7. Aseguramos permisos de ejecución
RUN chmod +x bin/*

# 8. Script de entrada para migraciones automáticas
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# 9. Variables de entorno de producción
ENV RAILS_ENV=production
ENV RAILS_LOG_TO_STDOUT=true
ENV PORT=3000

EXPOSE 3000

# 10. Comando de arranque
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]