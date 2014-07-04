class SigninController < ApplicationController
  $authorization = Signet::OAuth2::Client.new(
      :authorization_uri => ENV['AUTH_URI'],
      :token_credential_uri => ENV['TOKEN_URI'],
      :client_id => ENV['CLIENT_ID'],
      :client_secret => ENV['CLIENT_SECRET'],
      :redirect_uri => ENV['REDIRECT_URIS'],
      :scope => ENV['PLUS_LOGIN_SCOPE'])
  $client = Google::APIClient.new

  def index
    # Create a string for verification
    if !session[:state]
      state = (0...13).map{('a'..'z').to_a[rand(26)]}.join
      session[:state] = state
    end
    @state = session[:state]
  end

  def connect
    # Get the token from the session if available or exchange the authorization
    # code for a token.
    if !session[:token]
      # Make sure that the state we set on the client matches the state sent
      # in the request to protect against request forgery.
      if session[:state] == params[:state]
        # Upgrade the code into a token object.
        responseData = request.body.read

        $authorization.code = responseData.split(',')[0]
        $client.authorization = $authorization
        id_token = responseData.split(',')[1]
        encoded_json_body = id_token.split('.')[1]
        # Base64 must be a multiple of 4 characters long, trailing with '='
        encoded_json_body += (['='] * (encoded_json_body.length % 4)).join('')
        json_body = Base64.decode64(encoded_json_body)
        body = JSON.parse(json_body)
        # You can read the Google user ID in the ID token.
        # "sub" represents the ID token subscriber which in our case
        # is the user ID. This sample does not use the user ID.
        gplus_id = body['sub']

        # Serialize and store the token in the user's session.
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
    # Check for stored credentials in the current user's session.
    if !session[:token]
      render json: 'User not connected.'.to_json
    end

    # Authorize the client and construct a Google+ service.
    $client.authorization.update_token!(session[:token].to_hash)
    plus = $client.discovered_api('plus', 'v1')

    # Get the list of people as JSON and return it.
    response = $client.execute!(plus.people.list,
        :collection => 'visible',
        :userId => 'me').body
    render json: response.to_json
  end

  def disconnect
    # halt 401, 'No stored credentials' unless session[:token]
    if session[:token]
      # Use either the refresh or access token to revoke if present.
      token = session[:token]

      # You could reset the state at this point, but as-is it will still stay unique
      # to this user and we're avoiding resetting the client state.
      # session.delete(:state)
      session.delete(:token)

      # Send the revocation request and return the result.
      revokePath = 'https://accounts.google.com/o/oauth2/revoke?token=' + token
      uri = URI.parse(revokePath)
      request = Net::HTTP.new(uri.host, uri.port)
      request.use_ssl = true
      request.get(uri.request_uri).code

      render json: 'User disconnected.'.to_json
    else
      render json: 'User not connected.'.to_json
    end
  end
end