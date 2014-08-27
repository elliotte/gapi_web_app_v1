class CirclesController < ApplicationController

	before_action :discover_api
	before_action :get_circle, only: [:show]

	def index
    	# Get the list of circles.
	    response = $client.execute!(:api_method => @plus_domain.circles.list,
	                                :parameters => {:userId => 'me'})

	    render json: response.data.to_json
	end

	def show
	    render json: @response.data.to_json
	end

	def create
		# Create a new circle.
		circle = {
		    'displayName' => 'Club',
		    'description' => 'Fukre Club'
		}

	    response = $client.execute!(:api_method => @plus_domain.circles.insert,
	                                :parameters => {:userId => params[:user_id]},
		                        	:body => JSON.dump(circle),
		                        	:headers => {'Content-Type' => 'application/json'})

	    render json: response.data.to_json
	end

	def destroy
		# Delete the circle.
		response = $client.execute!(:api_method => @plus_domain.circles.remove,
									:parameters => {:circleId => params[:id]})

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus_domain = $client.discovered_api('plusDomains', 'v1')
	end

	def get_circle
		# Get the circle
		@response = $client.execute!(:api_method => @plus_domain.circles.get,
									:parameters => {:circleId => params[:id]})
	end
end
