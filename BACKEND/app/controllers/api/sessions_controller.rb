module Api
  class SessionsController < ApplicationController
    # Evita que Rails busque el token de autenticidad de formularios (CSRF)
    skip_before_action :verify_authenticity_token, only: [:create]

    def create
      # Intentamos obtener el email ya sea que venga dentro de :user o suelto
      email = params[:user].present? ? params[:user][:email] : params[:email]
      password = params[:user].present? ? params[:user][:password] : params[:password]

      user = User.find_by(email: email)

      if user&.valid_password?(password)
        # Asegúrate de tener la clase JsonWebToken definida en lib/ o app/services/
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