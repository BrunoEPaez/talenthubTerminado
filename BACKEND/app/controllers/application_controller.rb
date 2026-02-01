# app/controllers/application_controller.rb
class ApplicationController < ActionController::API
  def authenticate_user_from_token
    header = request.headers['Authorization']
    return render json: { error: 'Token faltante' }, status: :unauthorized if header.blank?

    token = header.split(' ').last

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue => e
      render json: { error: 'No autorizado' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
