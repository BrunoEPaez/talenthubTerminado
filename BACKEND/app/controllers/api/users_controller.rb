class Api::UsersController < ApplicationController
  # Eliminamos la línea que causaba el error de :verify_authenticity_token
  skip_before_action :authenticate_user_from_token, only: [:create], raise: false
  
  def create
    user = User.new(sign_up_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: { user: user, token: token }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update_cv
    # Buscamos por el email que enviamos desde el FormData
    @user = User.find_by(email: params[:user_email])

    if @user
      if params[:cv].present?
        @user.cv.attach(params[:cv])
        
        if @user.save
          cv_url = Rails.application.routes.url_helpers.rails_blob_url(@user.cv, only_path: true)
          render json: { 
            message: "CV actualizado", 
            cv_url: cv_url,
            cv_name: @user.cv.filename.to_s
          }, status: :ok
        else
          render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: "No hay archivo" }, status: :bad_request
      end
    else
      render json: { error: "Usuario no encontrado" }, status: :not_found
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end