Rails.application.routes.draw do
  # Health Check para Render
  root to: "rails/health#show"
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # Empleos: index, show, create, update, destroy
    resources :jobs
    
    # Favoritos
    resources :favorites, only: [:index, :create]
    # Borrar un favorito específico de un trabajo
    delete 'favorites/:job_id', to: 'favorites#destroy'

    # Postulaciones (Applications)
    resources :applications, only: [:index, :create]
    delete 'applications/:job_id', to: 'applications#destroy'
    
    # Ruta especial: Ver quién se postuló a MIS empleos
    get 'my_job_applications', to: 'applications#index_for_my_jobs'

    # Usuarios y Sesiones
    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end
end