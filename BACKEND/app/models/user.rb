class User < ApplicationRecord
  # Configuración de Devise
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Relaciones
  has_many :jobs, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorite_jobs, through: :favorites, source: :job
  has_many :applications, dependent: :destroy
  has_many :applied_jobs, through: :applications, source: :job

  # Active Storage para el Currículum
  # Asegúrate de tener instalada la gema 'active_storage' y sus tablas
  has_one_attached :cv

  # Validaciones adicionales (Opcional, Devise ya valida email y password)
  validates :email, presence: true, uniqueness: true
end