class User < ApplicationRecord
  # Si usas Devise
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Relaciones
  has_many :jobs, dependent: :destroy
  has_many :favorites, dependent: :destroy
  has_many :favorite_jobs, through: :favorites, source: :job
  has_many :applications, dependent: :destroy
  has_many :applied_jobs, through: :applications, source: :job

  # Active Storage para el Currículum
  has_one_attached :cv
end