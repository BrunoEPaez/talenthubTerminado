class AuthenticationController < ApplicationController
  # Saltamos la verificación de autenticación para poder loguearnos
  skip_before_action :authenticate_request, only: [:login], raise: false

  def login
    @user = User.find_by_email(params[:email])

    if @user&.valid_password?(params[:password])
      token = JsonWebToken.encode(user_id: @user.id)
      render json: { token: token, email: @user.email }, status: :ok
    else
      render json: { error: 'No autorizado: Email o contraseña incorrectos' }, status: :unauthorized
    end
  end
end