##
# Serializes and deserializes the token.
class TokenPair
  @refresh_token
  @access_token
  @expires_in
  @issued_at

  def update_token!(object)
    @refresh_token = object.refresh_token
    @access_token = object.access_token
    @expires_in = object.expires_in
    @issued_at = object.issued_at
  end

  def to_hash
    return {
      :refresh_token => @refresh_token,
      :access_token => @access_token,
      :expires_in => @expires_in,
      :issued_at => @issued_at}
  end
end