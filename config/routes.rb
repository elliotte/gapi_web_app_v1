GooglePlay::Application.routes.draw do
  resources :signin, :only => [:index] do
    collection do
      post :connect
      post :disconnect
      post :save_user
    end
  end

  resources :activities, :only => [:index, :show] do
    resources :comments, :only => [:index]
    collection do
      get :search
    end
  end

  resources :comments, :only => [:show]

  resources :calendar_events, :only => [:index, :show, :update, :destroy]

  resources :files, :only => [:index, :show, :create, :update, :destroy] do
    resources :file_comments, :only => [:index, :show, :create, :update, :destroy], :path => 'comments', :as => 'comments' do
      resources :replies, :only => [:index, :show]
    end
    member do
      post :copy
      post :touch
      post :trash
      post :untrash
    end
  end

  resources :peoples, :only => [:index, :show] do
    collection do
      get :search
      get :list_by_activity
    end
  end

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
