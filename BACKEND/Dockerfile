# 1. Usamos la imagen oficial de Ruby
FROM ruby:3.3.9

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

# === PASO CLAVE: ARREGLAR PERMISOS ===
# Esto le da permiso a Rails para ejecutarse dentro del contenedor
RUN chmod +x bin/*

# 7. Variables de entorno
ENV RAILS_ENV=production
ENV PORT=3000
EXPOSE 3000

# 8. Comando de arranque: Migrar + Servidor
# Usamos "bundle exec" para evitar problemas de rutas
CMD ["bundle", "exec", "rails", "s", "-b", "0.0.0.0", "-p", "3000"]