class ApplicationController < ActionController::Base
  	protect_from_forgery with: :exception

  	$authorization = Signet::OAuth2::Client.new(
      	:authorization_uri => ENV['AUTH_URI'],
      	:token_credential_uri => ENV['TOKEN_URI'],
      	:client_id => ENV['CLIENT_ID'],
      	:client_secret => ENV['CLIENT_SECRET'],
      	:redirect_uri => ENV['REDIRECT_URIS'],
      	:scope => ENV['PLUS_LOGIN_SCOPE'])
  	$client = Google::APIClient.new
end
