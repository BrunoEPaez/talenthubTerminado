module Api
  class SessionsController < ApplicationController
    # ELIMINADO: skip_before_action :verify_authenticity_token
    # En Rails API mode, este callback no existe, por eso daba error 500 al iniciar.

    def create
      # Extraemos email y password independientemente de si vienen 
      # envueltos en { "user": { ... } } o no.
      email = params[:user].present? ? params[:user][:email] : params[:email]
      password = params[:user].present? ? params[:user][:password] : params[:password]

      user = User.find_by(email: email)

      # Verificamos la contraseña (funciona con Devise)
      if user&.valid_password?(password)
        # Generamos el token JWT
        token = JsonWebToken.encode(user_id: user.id)
        
        render json: { 
          token: token, 
          user: { id: user.id, email: user.email } 
        }, status: :ok
      else
        render json: { error: 'Email o contraseña inválidos' }, status: :unauthorized
      end
    end
  end
end