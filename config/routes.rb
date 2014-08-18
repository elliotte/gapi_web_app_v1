GooglePlay::Application.routes.draw do
  resources :signin, :only => [:index] do
    collection do
      get :people
      post :connect
      post :disconnect
      post :save_user
    end
  end

  resources :activities, :only => [:index, :show]

  resources :calendar_events, :only => [:index, :show, :update, :destroy]

  resources :files, :only => [:index, :show, :create]

  resources :task_lists, :only => [:index, :show, :create, :update, :destroy] do
    resources :tasks, :only => [:index, :show, :create, :update, :destroy] do
      member do
        put :complete_task
      end
      collection do
        post :clear
      end
    end
  end

  root 'signin#index'
end
