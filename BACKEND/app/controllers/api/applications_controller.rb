module Api
  class ApplicationsController < ApplicationController
    # Todas las rutas de este controlador requieren token válido
    before_action :authenticate_user_from_token

    # GET /api/applications
    # Lista las postulaciones que el usuario actual ha realizado
    def index
      begin
        @applications = @current_user.applications.includes(:job)
        render json: @applications.as_json(include: :job)
      rescue => e
        render json: { error: "Error al cargar tus postulaciones: #{e.message}" }, status: :internal_server_error
      end
    end

    # POST /api/applications
    # Un usuario se postula a un empleo
    def create
      # 1. Validar que el empleo exista
      unless Job.exists?(params[:job_id])
        return render json: { error: "El empleo ya no está disponible o no existe" }, status: :not_found
      end

      # 2. Buscar postulación existente o crear una nueva (evita duplicados)
      @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
      
      # 3. Si se sube un CV específico en este formulario, se adjunta
      if params[:cv].present?
        @application.cv.attach(params[:cv])
      end

      if @application.save
        render json: { 
          message: "¡Postulación enviada con éxito!", 
          application: @application.as_json(include: :job) 
        }, status: :created
      else
        render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/applications
    # Un usuario retira su postulación (basado en el job_id)
    def destroy
      @application = @current_user.applications.find_by(job_id: params[:job_id])
      
      if @application&.destroy
        render json: { message: "Has retirado tu postulación correctamente" }, status: :ok
      else
        render json: { error: "No se encontró la postulación para este empleo" }, status: :not_found
      end
    end

    # GET /api/my_job_applications
    # Para empleadores: ver quién se postuló a los empleos que ellos publicaron
    def index_for_my_jobs
      begin
        # Buscamos aplicaciones de empleos cuyo dueño es el usuario actual
        @applications = Application.joins(:job).where(jobs: { user_id: @current_user.id })
        
        render json: @applications.map { |app| 
          {
            id: app.id,
            user_id: app.user_id,
            user_email: app.user.email,
            job_title: app.job.title,
            job_id: app.job_id,
            # Lógica para obtener el link del CV (de la postulación o del perfil)
            cv_url: get_cv_url(app),
            applied_at: app.created_at
          }
        }
      rescue => e
        render json: { error: "Error al obtener candidatos: #{e.message}" }, status: :internal_server_error
      end
    end

    private

    def get_cv_url(app)
      # 1. Verificamos si hay un CV específico en la aplicación
      # 2. Si no, verificamos si el usuario tiene uno en su perfil
      attachment = app.cv.attached? ? app.cv : app.user.cv
      
      if attachment.attached?
        # Genera la URL para descargar el archivo desde ActiveStorage
        Rails.application.routes.url_helpers.rails_blob_url(attachment, only_path: true)
      else
        nil
      end
    rescue
      nil
    end
  end
end