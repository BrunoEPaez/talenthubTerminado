class ApplicationController < ActionController::API
  # Método para proteger las rutas
  def authenticate_user_from_token
    header = request.headers['Authorization']
    if header.blank?
      return render json: { error: 'Token faltante' }, status: :unauthorized
    end

    token = header.split(' ').last

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Usuario no encontrado' }, status: :unauthorized
    rescue JWT::ExpiredSignature
      render json: { error: 'El token ha expirado' }, status: :unauthorized
    rescue => e
      render json: { error: 'Token inválido' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end