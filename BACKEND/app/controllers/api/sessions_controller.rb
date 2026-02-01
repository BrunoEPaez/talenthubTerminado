# app/controllers/api/sessions_controller.rb
class Api::SessionsController < ApplicationController # ANTES: Devise::SessionsController
  respond_to :json

  def create
    # Cambiamos la forma de recibir parámetros para que sea más robusta
    user_params = params.require(:user).permit(:email, :password)
    user = User.find_for_authentication(email: user_params[:email])

    if user&.valid_password?(user_params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: { user: user, token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end
end