module Api
  class ApplicationsController < ApplicationController
    before_action :authenticate_user_from_token

    # GET /api/applications -> Mis postulaciones (Candidato)
    def index
      begin
        @applications = @current_user.applications.includes(:job)
        # Aseguramos devolver un array aunque esté vacío para que React no falle
        render json: @applications.as_json(include: :job) || []
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end
    end

    # POST /api/applications -> Postularme
    def create
      return render json: { error: "ID de empleo faltante" }, status: :bad_request if params[:job_id].blank?

      @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
      @application.cv.attach(params[:cv]) if params[:cv].present?

      if @application.save
        render json: { message: "Postulación exitosa", application: @application.as_json(include: :job) }, status: :created
      else
        render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # GET /api/my_job_applications -> Candidatos (Empleador)
    def index_for_my_jobs
      begin
        # Cargamos usuario y empleo de una vez para evitar lentitud
        @applications = Application.joins(:job)
                                   .where(jobs: { user_id: @current_user.id })
                                   .includes(:user, :job)

        data = @applications.map do |app|
          {
            id: app.id,
            user_id: app.user_id,
            user_email: app.user.email,
            job_title: app.job.title,
            job_id: app.job_id,
            cv_url: get_cv_url(app),
            applied_at: app.created_at
          }
        end
        render json: data || []
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end
    end

    # DELETE /api/applications -> Retirar postulación
    def destroy
      @application = @current_user.applications.find_by(job_id: params[:job_id])
      if @application&.destroy
        render json: { message: "Postulación retirada" }, status: :ok
      else
        render json: { error: "No se encontró la postulación" }, status: :not_found
      end
    end

    private

    def get_cv_url(app)
      attachment = app.cv.attached? ? app.cv : app.user.cv
      return nil unless attachment.attached?
      
      # Retornamos la ruta que ActiveStorage entiende
      Rails.application.routes.url_helpers.rails_blob_path(attachment, only_path: true)
    rescue
      nil
    end
  end
end