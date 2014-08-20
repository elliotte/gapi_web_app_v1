class SigninController < ApplicationController

  skip_before_filter :verify_token, except: [:disconnect]

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
end