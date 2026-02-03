Rails.application.routes.draw do
  # Todas las rutas empezarán con /api para que coincidan con tu VITE_API_URL
  namespace :api, defaults: { format: :json } do
    
    # Rutas cuyos controladores están AFUERA (app/controllers/)
    resources :jobs, controller: '/jobs'
    resources :favorites, only: [:index, :create], controller: '/favourites'
    delete 'favorites', to: '/favourites#destroy'
    
    resources :applications, only: [:index, :create], controller: '/applications'
    get '/my_job_applications', to: '/applications#index_for_my_jobs'

    # Rutas cuyos controladores están ADENTRO (app/controllers/api/)
    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end
end