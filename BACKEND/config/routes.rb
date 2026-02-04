Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # Ofertas de trabajo
    resources :jobs

    # Favoritos: Permite GET (index), POST (create) y DELETE (destroy)
    resources :favorites, only: [:index, :create]
    delete 'favorites', to: 'favorites#destroy' # Para borrar por job_id

    # Postulaciones
    resources :applications, only: [:index, :create]
    delete 'applications', to: 'applications#destroy' # ✅ Agregado para el botón "Retirar"
    
    # Vista para reclutadores (quién se postuló a mis trabajos)
    get '/my_job_applications', to: 'applications#index_for_my_jobs'

    # Usuarios y Sesiones
    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end
end