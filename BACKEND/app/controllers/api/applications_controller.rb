# app/controllers/api/applications_controller.rb
module Api
  class ApplicationsController < ApplicationController
    before_action :authenticate_user_from_token

    def index
      render json: @current_user.applications.select(:id, :job_id)
    end

    def create
      @application = @current_user.applications.find_or_initialize_by(job_id: params[:job_id])
      @application.cv.attach(params[:cv]) if params[:cv].present?

      if @application.save
        render json: { message: "Postulación exitosa", cv_url: @application.cv_url }, status: :created
      else
        render json: { errors: @application.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @application = @current_user.applications.find_by(job_id: params[:job_id])
      if @application
        @application.destroy
        render json: { message: "Postulación retirada" }, status: :ok
      else
        render json: { error: "No se encontró la postulación" }, status: :not_found
      end
    end

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
end