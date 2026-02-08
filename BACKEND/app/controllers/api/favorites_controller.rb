module Api
  class FavoritesController < ApplicationController
    # Asegúrate de que este método exista en tu ApplicationController
    before_action :authenticate_user_from_token

    # GET /api/favorites
    # Lista todos los trabajos favoritos del usuario actual
    def index
      @favorites = @current_user.favorites.includes(:job)
      # Retornamos solo los IDs de los trabajos para facilitar la sincronización en el frontend
      # y también el objeto job completo para el Dashboard
      render json: @favorites.as_json(include: :job)
    end

    # POST /api/favorites
    # Crea un favorito nuevo
    def create
      # Usamos params[:job_id] que es lo que envía tu JobDetail.tsx
      job_id = params[:job_id] || params[:id]
      
      if job_id.nil?
        return render json: { error: "Falta el job_id" }, status: :bad_request
      end

      @favorite = @current_user.favorites.find_or_initialize_by(job_id: job_id)
      
      if @favorite.save
        render json: { 
          message: "Guardado en favoritos", 
          favorite: @favorite,
          favorite_ids: @current_user.favorites.pluck(:job_id) # Útil para actualizar el estado global
        }, status: :created
      else
        render json: { errors: @favorite.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/favorites
    # DELETE /api/favorites/:job_id
    def destroy
      # Esta línea es la CLAVE: busca el favorito ya sea que el ID venga en la ruta 
      # o como un parámetro job_id en el cuerpo de la petición (Axios DELETE)
      job_id_to_remove = params[:job_id] || params[:id]

      @favorite = @current_user.favorites.find_by(job_id: job_id_to_remove)
      
      if @favorite
        @favorite.destroy
        render json: { 
          message: "Eliminado de favoritos",
          favorite_ids: @current_user.favorites.pluck(:job_id) 
        }, status: :ok
      else
        # Si no lo encuentra, respondemos con éxito igual para no romper el estado del frontend
        # o puedes mantener el 404 si prefieres depurar estrictamente.
        render json: { message: "El favorito no existía o ya fue eliminado" }, status: :ok
      end
    end
  end
end