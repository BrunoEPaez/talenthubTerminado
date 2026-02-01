class ApplicationsController < ApplicationController
  before_action :authenticate_user_from_token

  # GET /applications
  def index
    # Devolvemos las postulaciones del usuario incluyendo el job_id 
    # para que el frontend pueda verificar con .some()
    render json: @current_user.applications.select(:id, :job_id)
  end

  # POST /applications
  def create
    @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
    
    if params[:cv].present?
      @application.cv.attach(params[:cv])
    end

    if @application.save
      render json: { message: "Postulación exitosa", cv_url: @application.cv_url }, status: :created
    else
      render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /applications
  # ✅ NUEVO MÉTODO PARA RETIRAR POSTULACIÓN
  def destroy
    @application = @current_user.applications.find_by(job_id: params[:job_id])

    if @application
      @application.destroy
      render json: { message: "Postulación retirada" }, status: :ok
    else
      render json: { error: "No se encontró la postulación" }, status: :not_found
    end
  end

  # GET /my_job_applications
  def index_for_my_jobs
    @applications = Application.joins(:job).where(jobs: { user_id: @current_user.id })
    render json: @applications.map { |app| {
        id: app.id,
        user_email: app.user.email,
        job_title: app.job.title,
        cv_url: app.cv_url
      }
    }
  end
end