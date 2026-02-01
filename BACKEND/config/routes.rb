Rails.application.routes.draw do
  default_url_options host: 'localhost:3000'

  # Rutas de Trabajos (incluye index, show, create, update, destroy)
  resources :jobs
  
  # Rutas de Favoritos
  # GET /favorites -> index
  # POST /favorites -> create
  resources :favorites, only: [:index, :create]
  # Permite borrar favoritos usando DELETE /favorites?job_id=1
  delete 'favorites', to: 'favorites#destroy'
  
  # Rutas de Postulaciones (Applications)
  resources :applications, only: [:index, :create]
  delete 'applications', to: 'applications#destroy'
  get '/my_job_applications', to: 'applications#index_for_my_jobs'

  # Namespace para Autenticación
  namespace :api, defaults: { format: :json } do
    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end
end