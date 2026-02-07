module Api
  class JobsController < ApplicationController
    # El token se pide para crear, borrar o editar
    before_action :authenticate_user_from_token, only: [:create, :destroy, :update]

    # GET /api/jobs
    def index
      # Ordenamos por los más nuevos primero
      @jobs = Job.all.order(created_at: :desc)
      render json: @jobs
    end

    # GET /api/jobs/:id
    def show
      @job = Job.find(params[:id])
      render json: @job
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Trabajo no encontrado" }, status: :not_found
    end

    # POST /api/jobs
    def create
      # Verificación de seguridad extra por si authenticate_user_from_token falla
      if @current_user.nil?
        return render json: { error: "Debes iniciar sesión para publicar" }, status: :unauthorized
      end

      @job = @current_user.jobs.build(job_params)
      
      if @job.save
        render json: @job, status: :created
      else
        render json: { errors: @job.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH/PUT /api/jobs/:id
    def update
      @job = @current_user.jobs.find_by(id: params[:id])
      
      if @job && @job.update(job_params)
        render json: @job
      else
        render json: { error: 'No tienes permiso para editar este empleo o los datos son inválidos' }, status: :unauthorized
      end
    end

    # DELETE /api/jobs/:id
    def destroy
      @job = @current_user.jobs.find_by(id: params[:id])
      
      if @job
        @job.destroy
        render json: { message: 'Eliminado correctamente' }, status: :ok
      else
        render json: { error: 'No tienes permiso para eliminar este empleo' }, status: :unauthorized
      end
    end

    private

    def job_params
      params.require(:job).permit(:title, :company, :description, :location, :job_type, :modality, :salary)
    end
  end
end