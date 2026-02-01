class FavoritesController < ApplicationController
  before_action :authenticate_user_from_token

  def index
    render json: @current_user.favorite_jobs
  end

  def create
    # Esto busca si ya existe, si no, lo crea.
    favorite = @current_user.favorites.find_or_create_by(job_id: params[:job_id])
    if favorite
      render json: { message: "Guardado" }, status: :created
    else
      render json: { error: "Error" }, status: :unprocessable_entity
    end
  end

  def destroy
    favorite = @current_user.favorites.find_by(job_id: params[:job_id])
    favorite&.destroy
    render json: { message: "Eliminado" }
  end
end