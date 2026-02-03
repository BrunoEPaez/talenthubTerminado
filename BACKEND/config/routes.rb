Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    resources :jobs
    resources :favorites, only: [:index, :create]
    delete 'favorites', to: 'favorites#destroy'
    
    resources :applications, only: [:index, :create]
    get '/my_job_applications', to: 'applications#index_for_my_jobs'

    post 'register', to: 'users#create'
    post 'login', to: 'sessions#create'
    put 'profile/update_cv', to: 'users#update_cv'
  end
end