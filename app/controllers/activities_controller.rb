class ActivitiesController < ApplicationController

	before_action :discover_api

	def index
    	# Get the list of Activities as JSON.
    	response = $client.execute!(@plus.activities.list,
                                	:collection => 'public',
                                	:userId => 'me').body

    	render json: JSON.parse(response).to_json
	end

	def show
    	# Get the Activity.
    	response = $client.execute!(@plus.activities.get,
                                	:activityId => params[:id]).body

    	render json: JSON.parse(response).to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
