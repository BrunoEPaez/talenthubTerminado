class Users::SessionsController < Devise::SessionsController
  respond_to :json

  def create
    user = User.find_by(email: sign_in_params[:email])

    if user&.valid_password?(sign_in_params[:password])
      token = JWT.encode(
        { user_id: user.id },
        Rails.application.secret_key_base
      )

      render json: {
        token: token,
        email: user.email
      }, status: :ok
    else
      render json: {
        error: 'Email o password incorrectos'
      }, status: :unauthorized
    end
  end

  protected

  def sign_in_params
    params.require(:user).permit(:email, :password)
  end
end
