module Api
  class FavoritesController < ApplicationController
    before_action :authenticate_user_from_token

    # GET /api/favorites
    def index
      # Traemos los favoritos incluyendo los datos del trabajo (job)
      @favorites = @current_user.favorites.includes(:job)
      render json: @favorites.as_json(include: :job)
    end

    # POST /api/favorites
    def create
      # Evita duplicados: busca si ya existe o lo inicializa
      @favorite = @current_user.favorites.find_or_initialize_by(job_id: params[:job_id])
      
      if @favorite.save
        render json: { message: "Guardado en favoritos", favorite: @favorite }, status: :created
      else
        render json: { errors: @favorite.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/favorites
    def destroy
      # Buscamos por job_id ya que es lo que suele enviar el frontend
      @favorite = @current_user.favorites.find_by(job_id: params[:job_id])
      
      if @favorite
        @favorite.destroy
        render json: { message: "Eliminado de favoritos" }, status: :ok
      else
        render json: { error: "No se encontró el favorito" }, status: :not_found
      end
    end
  end
end