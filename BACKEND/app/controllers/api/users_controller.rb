module Api
  class UsersController < ApplicationController
    # El registro no necesita token, pero update_cv SÍ lo necesita por seguridad
    skip_before_action :authenticate_user_from_token, only: [:create], raise: false
    before_action :authenticate_user_from_token, only: [:update_cv]

    # POST /api/register
    def create
      user = User.new(sign_up_params)
      if user.save
        token = JsonWebToken.encode(user_id: user.id)
        render json: { user: user, token: token }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/profile/update_cv
    def update_cv
      # @current_user ya viene definido por el método authenticate_user_from_token
      if params[:cv].present?
        @current_user.cv.attach(params[:cv])
        
        if @current_user.save
          # Generamos la URL completa del archivo
          cv_url = Rails.application.routes.url_helpers.rails_blob_url(@current_user.cv, only_path: true)
          
          render json: { 
            message: "CV actualizado correctamente", 
            cv_url: cv_url,
            cv_name: @current_user.cv.filename.to_s
          }, status: :ok
        else
          render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: "No se proporcionó ningún archivo" }, status: :bad_request
      end
    end

    private

    def sign_up_params
      params.require(:user).permit(:email, :password, :password_confirmation)
    end
  end
end