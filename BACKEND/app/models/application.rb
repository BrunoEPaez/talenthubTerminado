class Application < ApplicationRecord
  belongs_to :user
  belongs_to :job

  # Active Storage para el archivo físico
  has_one_attached :cv

  # Helpers para simplificar la respuesta del controlador
  def user_email
    user.email
  end

  def job_title
    job.title
  end

  def cv_url
    return nil unless cv.attached?
    
    # Genera la URL del archivo
    Rails.application.routes.url_helpers.rails_blob_url(cv, only_path: true)
  end
end