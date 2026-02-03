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

# 6. Forzamos a Rails a usar el puerto 3000 y ser visible para internet
ENV PORT=3000
EXPOSE 3000

# 7. El comando de arranque definitivo
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]  