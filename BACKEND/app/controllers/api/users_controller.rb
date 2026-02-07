module Api
  class UsersController < ApplicationController
    # El registro no necesita token
    skip_before_action :authenticate_user_from_token, only: [:create], raise: false
    before_action :authenticate_user_from_token, only: [:update_cv]

    # POST /api/register
    def create
      user = User.new(sign_up_params)
      if user.save
        # Asegúrate de tener la clase JsonWebToken definida en lib/ o app/services/
        token = JsonWebToken.encode(user_id: user.id)
        render json: { 
          user: { id: user.id, email: user.email }, 
          token: token 
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PUT /api/profile/update_cv
    def update_cv
      if params[:cv].present?
        @current_user.cv.attach(params[:cv])
        
        if @current_user.save
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