class SigninController < ApplicationController

  before_filter :verify_token, except: [:index, :connect, :save_user]

  $authorization = Signet::OAuth2::Client.new(
      :authorization_uri => ENV['AUTH_URI'],
      :token_credential_uri => ENV['TOKEN_URI'],
      :client_id => ENV['CLIENT_ID'],
      :client_secret => ENV['CLIENT_SECRET'],
      :redirect_uri => ENV['REDIRECT_URIS'],
      :scope => ENV['PLUS_LOGIN_SCOPE'])
  $client = Google::APIClient.new

  # $authorization = Signet::OAuth2::Client.new(
  #     :authorization_uri => "https://accounts.google.com/o/oauth2/auth",
  #     :token_credential_uri => "https://accounts.google.com/o/oauth2/token",
  #     :client_id => "861321116128-uhn4jo21t8f3gf22v514k0ci243ubm2r.apps.googleusercontent.com",
  #     :client_secret => "NkvWi_yG_tWlKf-B8et7t-rw",
  #     :redirect_uri => "postmessage",
  #     :scope => 'https://www.googleapis.com/auth/plus.login')
  # $client = Google::APIClient.new

  def index
    # Create a string for verification
    if !session[:state]
      state = (0...13).map{('a'..'z').to_a[rand(26)]}.join
      session[:state] = state
    end
    @state = session[:state]
  end

  def connect
    if !session[:token]
      if session[:state] == params[:state]
        responseData = request.body.read

        $authorization.code = responseData.split(',')[0]
        $client.authorization = $authorization
        id_token = responseData.split(',')[1]
        encoded_json_body = id_token.split('.')[1]
        
        encoded_json_body += (['='] * (encoded_json_body.length % 4)).join('')
        json_body = Base64.decode64(encoded_json_body)
        body = JSON.parse(json_body)
        gplus_id = body['sub']

        session[:token] = responseData.split(',')[2]
      else
        render json: 'The client state does not match the server state.'.to_json
      end
      render json: "Connected".to_json
    else
      render json: 'Current user is already connected.'.to_json
    end
  end

  def people
    # Authorizing the client and constructing a Google+ service.
    plus = $client.discovered_api('plus', 'v1')

    # Get the list of people as JSON.
    response = $client.execute!(plus.people.list,
        :collection => 'visible',
        :userId => 'me').body

    render json: JSON.parse(response).to_json
  end

  def calendar
    # Authorizing the client and constructing a Google+ service.
    calendar = $client.discovered_api('calendar', 'v3')

    # Get the list of calendar events.
    response = $client.execute(:api_method => calendar.events.list,
                              :parameters => {'calendarId' => 'primary'})

    render json: response.data.to_json
  end

  def drive
    # Authorizing the client and constructing a Google+ service.
    drive = $client.discovered_api('drive', 'v2')

    # Get the list of files in drive
    response = $client.execute(:api_method => drive.files.list)

    render json: response.data.to_json
  end

  def task_lists
    # Authorizing the client and constructing a Google+ service.
    tasks = $client.discovered_api('tasks', 'v1')

    # Get the task lists.
    response = $client.execute(:api_method => tasks.tasklists.list)

    render json: response.data.to_json
  end

  def tasks
    # Authorizing the client and constructing a Google+ service.
    tasks = $client.discovered_api('tasks', 'v1')

    # Get the list of tasks in task list.
    response = $client.execute(:api_method => tasks.tasks.list,
                              :parameters => {'tasklist' => params[:task_list_id]})

    render json: response.data.to_json
  end

  def complete_task
    # Authorizing the client and constructing a Google+ service.
    tasks = $client.discovered_api('tasks', 'v1')

    # Get the task with tasklist id and task id.
    response = $client.execute(:api_method => tasks.tasks.get,
                              :parameters => {'tasklist' => params[:task_list_id], 'task' => params[:task_id]})

    task = response.data
    task.status = 'completed'

    # Update the task with status as complete
    result = $client.execute(:api_method => tasks.tasks.update,
                              :parameters => {'tasklist' => params[:task_list_id], 'task' => params[:task_id]},
                              :body_object => task,
                        	  :headers => {'Content-Type' => 'application/json'})

    render json: result.data.to_json
  end

  def activity_feed
    # Authorizing the client and constructing a Google+ service.
    plus = $client.discovered_api('plus', 'v1')

    # Get the list of Activities as JSON.
    response = $client.execute!(plus.activities.list,
        :collection => 'public',
        :userId => 'me').body

    render json: JSON.parse(response).to_json
  end

  def disconnect
    # Using either the refresh or access token to revoke if present.
    token = session[:token]

    # Destroy session token
    session.delete(:token)

    # Sending the revocation request and returning the result.
    revokePath = 'https://accounts.google.com/o/oauth2/revoke?token=' + token
    uri = URI.parse(revokePath)
    request = Net::HTTP.new(uri.host, uri.port)
    request.use_ssl = true
    request.get(uri.request_uri).code

    render json: 'User disconnected.'.to_json
  end

  def save_user
    # Save or find User
    if User.find_or_create_by(google_id: request.body.read)
      render json: 'User is saved.'.to_json
    else
      render json: 'User is not saved.'.to_json
    end
  end

  def verify_token
    # Check for stored credentials in the current user's session.
    if !session[:token]
      render json: 'User is not connected.'.to_json
    else
      $client.authorization.access_token = session[:token]
    end
  end
end