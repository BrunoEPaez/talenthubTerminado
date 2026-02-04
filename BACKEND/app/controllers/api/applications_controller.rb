module Api
  class ApplicationsController < ApplicationController
    before_action :authenticate_user_from_token

    # GET /api/applications
    def index
      # .includes(:job) evita que la base de datos trabaje de más (N+1 query)
      @applications = @current_user.applications.includes(:job)
      render json: @applications.as_json(include: :job)
    end

    # POST /api/applications
    def create
      # find_or_initialize_by evita que un usuario se postule dos veces al mismo empleo
      @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
      
      # Si se envía un CV específico en esta postulación, lo adjuntamos
      @application.cv.attach(params[:cv]) if params[:cv].present?

      if @application.save
        render json: { 
          message: "Postulación exitosa", 
          application: @application.as_json(include: :job) 
        }, status: :created
      else
        render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/applications
    def destroy
      @application = @current_user.applications.find_by(job_id: params[:job_id])
      if @application&.destroy
        render json: { message: "Postulación retirada" }, status: :ok
      else
        render json: { error: "No se encontró la postulación" }, status: :not_found
      end
    end

    # GET /api/my_job_applications
    def index_for_my_jobs
      # Muestra los candidatos que se postularon a los empleos creados por el usuario actual
      @applications = Application.joins(:job).where(jobs: { user_id: @current_user.id })
      
      render json: @applications.map { |app| 
        {
          id: app.id,
          user_email: app.user.email,
          job_title: app.job.title,
          cv_url: app.user.cv.attached? ? Rails.application.routes.url_helpers.rails_blob_url(app.user.cv, only_path: true) : nil
        }
      }
    end
  end
end