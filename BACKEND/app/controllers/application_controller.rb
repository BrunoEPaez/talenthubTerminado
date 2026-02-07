class ApplicationController < ActionController::API
  # Método para proteger las rutas
  def authenticate_user_from_token
    header = request.headers['Authorization']
    
    if header.blank?
      return render json: { error: 'Token faltante' }, status: :unauthorized
    end

    # Extrae el token (formato: "Bearer el_token_aqui")
    token = header.split(' ').last

    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Usuario no encontrado' }, status: :unauthorized
    rescue JWT::ExpiredSignature
      render json: { error: 'El token ha expirado' }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: 'Token con formato inválido' }, status: :unauthorized
    rescue => e
      render json: { error: "Error de autenticación: #{e.message}" }, status: :unauthorized
    end
  end

  # Helper para acceder al usuario desde cualquier controlador
  def current_user
    @current_user
  end
end