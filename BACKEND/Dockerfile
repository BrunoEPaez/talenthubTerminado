# 1. Usamos la imagen oficial de Ruby
FROM ruby:3.3.9

# 2. Instalamos dependencias necesarias para Rails y Postgres
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# 3. Creamos la carpeta donde vivirá la app en el servidor
WORKDIR /app

# 4. Copiamos los archivos de gemas e instalamos
COPY Gemfile Gemfile.lock ./
RUN bundle install

# 5. Copiamos todo el resto del código del backend
COPY . .

# Forzamos el entorno de producción y el puerto
ENV RAILS_ENV=production
ENV PORT=3000

EXPOSE 3000

# El comando con la bandera de producción
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000", "-e", "production"]