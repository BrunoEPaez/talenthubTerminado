Rails.application.routes.draw do
  # Health Check para Render (Monitoreo de disponibilidad)
  root to: "rails/health#show"
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    # --- EMPLEOS ---
    # Index, show, create, update, destroy
    resources :jobs

    # --- FAVORITOS ---
    # Permite: 
    # GET /api/favorites (lista)
    # POST /api/favorites (crear)
    resources :favorites, only: [:index, :create]
    
    # Soporta ambos formatos de borrado para evitar el Error 404:
    # DELETE /api/favorites (con job_id en el body)
    # DELETE /api/favorites/:job_id (ID en la URL)
    delete 'favorites', to: 'favorites#destroy'
    delete 'favorites/:job_id', to: 'favorites#destroy'

    # --- POSTULACIONES (APPLICATIONS) ---
    # Permite:
    # GET /api/applications (ver mis postulaciones enviadas)
    # POST /api/applications (postularse)
    resources :applications, only: [:index, :create]
    
    # Soporta borrar postulación (des-postularse) para evitar Error 404:
    # DELETE /api/applications (con job_id en el body)
    delete 'applications', to: 'applications#destroy'
    delete 'applications/:job_id', to: 'applications#destroy'
    
    # Ruta para empleadores: Ver quién se postuló a los empleos que YO publiqué
    get 'my_job_applications', to: 'applications#index_for_my_jobs'

    # --- USUARIOS Y SESIONES ---
    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end

  # --- SOLUCIÓN PARA ARCHIVOS (CV) EN RENDER ---
  # Render usa un sistema de archivos efímero. 
  # Esta ruta ayuda a que ActiveStorage use un proxy para servir los archivos
  # de forma más consistente antes de que se borren por el reinicio del servidor.
  get '/rails/active_storage/blobs/proxy/*signed_id/*filename', to: 'active_storage/blobs/proxy#show'
end