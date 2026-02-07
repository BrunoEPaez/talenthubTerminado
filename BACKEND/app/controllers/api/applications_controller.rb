module Api
  class ApplicationsController < ApplicationController
    # Todas las rutas de este controlador requieren token
    before_action :authenticate_user_from_token

    # GET /api/applications
    # Lista las postulaciones que YO he hecho como candidato
    def index
      @applications = @current_user.applications.includes(:job)
      render json: @applications.as_json(include: :job)
    end

    # POST /api/applications
    # Un usuario se postula a un empleo
    def create
      # Verificamos que el job_id exista antes de intentar nada
      unless Job.exists?(params[:job_id])
        return render json: { error: "El empleo no existe" }, status: :not_found
      end

      # find_or_initialize_by evita duplicados (un usuario -> un empleo)
      @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
      
      # Si se envía un CV específico para esta postulación (multipart/form-data)
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
    # Un usuario retira su postulación a un empleo específico
    def destroy
      @application = @current_user.applications.find_by(job_id: params[:job_id])
      
      if @application&.destroy
        render json: { message: "Postulación retirada correctamente" }, status: :ok
      else
        render json: { error: "No se encontró la postulación para este empleo" }, status: :not_found
      end
    end

    # GET /api/my_job_applications
    # Muestra los candidatos que se postularon a los empleos que YO publiqué
    def index_for_my_jobs
      @applications = Application.joins(:job).where(jobs: { user_id: @current_user.id })
      
      render json: @applications.map { |app| 
        {
          id: app.id,
          user_id: app.user_id,
          user_email: app.user.email,
          job_title: app.job.title,
          job_id: app.job_id,
          # Intentamos obtener el CV de la postulación, si no, el del perfil del usuario
          cv_url: get_cv_url(app)
        }
      }
    end

    private

    def get_cv_url(app)
      # Prioridad: CV adjunto a la postulación > CV del perfil del usuario
      attachment = app.cv.attached? ? app.cv : app.user.cv
      
      if attachment.attached?
        Rails.application.routes.url_helpers.rails_blob_url(attachment, only_path: true)
      else
        nil
      end
    end
  end
end