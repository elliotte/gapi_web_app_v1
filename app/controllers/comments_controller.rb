class CommentsController < ApplicationController

	before_action :discover_api

	def index
    	# List all of the comments for an activity.
    	if params[:page_token].present?
		    response = $client.execute!(@plus.comments.list,
  									{'activityId' => params[:activity_id],
  									'sortOrder' => 'descending',
		                            'pageToken' => params[:page_token]}).body
		else
			response = $client.execute!(@plus.comments.list,
  									{'activityId' => params[:activity_id],
  									'sortOrder' => 'descending'}).body
		end

    	render json: JSON.parse(response).to_json
	end

	def show
    	# Get a comment.
    	response = $client.execute!(@plus.comments.get,
                                	{'commentId' => params[:id]}).body

    	render json: JSON.parse(response).to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
