GooglePlay::Application.routes.draw do
  resources :signin, :only => [ :index ] do
    collection do
      get :people
      get :calendar
      get :drive
      get :task_lists
      get :tasks
      get :activity_feed
      post :connect
      post :disconnect
      post :save_user
      put :complete_task
    end
  end

  post '/signin/delete_calendar_event/:id', to: 'signin#delete_calendar_event', as: 'delete_calendar_event'
  get '/signin/show_calendar_event/:id', to: 'signin#show_calendar_event', as: 'show_calendar_event'
  post '/signin/update_calendar_event/:id', to: 'signin#update_calendar_event', as: 'update_calendar_event'

  root 'signin#index'
end
