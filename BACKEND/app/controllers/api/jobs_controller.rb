module Api
  class JobsController < ApplicationController
    # El token solo se pide para acciones que modifican datos
    # Asegúrate de que 'authenticate_user_from_token' esté definido en ApplicationController
    before_action :authenticate_user_from_token, only: [:create, :destroy, :update]

    # GET /api/jobs
    def index
      @jobs = Job.all
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
        render json: { error: 'No autorizado o error al editar' }, status: :unauthorized
      end
    end

    # DELETE /api/jobs/:id
    def destroy
      @job = @current_user.jobs.find_by(id: params[:id])
      if @job
        @job.destroy
        render json: { message: 'Eliminado correctamente' }, status: :ok
      else
        render json: { error: 'No autorizado' }, status: :unauthorized
      end
    end

    private

    def job_params
      params.require(:job).permit(:title, :company, :description, :location, :job_type, :modality)
    end
  end
end