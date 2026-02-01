class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  def create
    build_resource(sign_up_params)

    if resource.save
      token = JWT.encode(
        { user_id: resource.id },
        Rails.application.secret_key_base
      )

      render json: {
        token: token,
        email: resource.email
      }, status: :created
    else
      render json: {
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  protected

  def sign_up_params
    params.require(:user).permit(
      :email,
      :password,
      :password_confirmation
    )
  end
end
