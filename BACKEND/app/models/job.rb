class Job < ApplicationRecord
  belongs_to :user # El usuario que publica el empleo
  has_many :favorites, dependent: :destroy
  has_many :users, through: :favorites
  
  has_many :applications, dependent: :destroy
  has_many :applicants, through: :applications, source: :user

  # Validaciones para que no se guarde basura
  validates :title, :company, :description, :location, :job_type, :modality, presence: true
end