class ApplicationController < ActionController::API
  # Definimos current_user como un helper disponible en los controladores
  attr_reader :current_user

  # Método para proteger las rutas (usado con before_action en otros controladores)
  def authenticate_user_from_token
    header = request.headers['Authorization']
    
    if header.blank?
      render json: { error: 'Inicia sesión para continuar' }, status: :unauthorized
      return
    end

    # Extrae el token (formato: "Bearer el_token_aqui")
    token = header.split(' ').last

    begin
      # Decodificamos el token usando tu clase JsonWebToken
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
      
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Usuario inexistente' }, status: :unauthorized
    rescue JWT::ExpiredSignature
      render json: { error: 'Tu sesión ha expirado, por favor vuelve a entrar' }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: 'Token inválido' }, status: :unauthorized
    rescue => e
      render json: { error: "Error de seguridad: #{e.message}" }, status: :unauthorized
    end
  end

  private

  # Método opcional: permite saber quién es el usuario si envía token, 
  # pero NO bloquea la petición si no lo envía.
  def set_current_user_optional
    header = request.headers['Authorization']
    return if header.blank?

    token = header.split(' ').last
    begin
      decoded = JsonWebToken.decode(token)
      @current_user = User.find(decoded[:user_id])
    rescue
      @current_user = nil
    end
  end
end