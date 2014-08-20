class PeoplesController < ApplicationController

	before_action :discover_api

	def index
    	# Get the list of people.
	    response = $client.execute!(@plus.people.list,
	                                :collection => 'visible',
	                                :userId => 'me').body

	    render json: JSON.parse(response).to_json
	end

	def show
	    # Get a person's profile.
	    response = $client.execute!(@plus.people.get,
	                                :userId => params[:id]).body

	    render json: JSON.parse(response).to_json
	end

	def search
		# Search all public profiles.
		if params[:page_token].present?
		    response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'pageToken' => params[:page_token]}).body
		else
			response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query]}).body
		end

	    render json: JSON.parse(response).to_json
	end

	def list_by_activity
		# List all of the people in the specified collection for a particular activity.
		response = $client.execute!(@plus.people.list_by_activity,
								  {'activityId' => params[:activity_id],
								   'collection' => params[:collection]}).body
		
	    render json: JSON.parse(response).to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
