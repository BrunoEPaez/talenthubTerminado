# Be sure to restart your server when you modify this file.

# Avoid CORS issues by telling Rails to accept requests from your frontend.
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 'origins "*"' permite que cualquier aplicación acceda a tu API.
    # Si quieres más seguridad, puedes poner: origins 'https://talenthubterminado.pages.dev'
    origins "*"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      # 'expose' es útil si el frontend necesita leer headers específicos (como tokens)
      expose: ['Authorization', 'Access-Control-Allow-Origin']
  end
end