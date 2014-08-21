class RepliesController < ApplicationController

	before_action :discover_api
	before_action :get_reply, only: [:show, :update]

	def index
		# Lists all of the replies to a comment.
    	if params[:page_token].present?
		    response = $client.execute(:api_method => @drive.replies.list,
    									:parameters => {'fileId' => params[:file_id],
    													'commentId' => params[:comment_id],
		                            					'pageToken' => params[:page_token] })
		else
			response = $client.execute(:api_method => @drive.replies.list,
    									:parameters => {'fileId' => params[:file_id],
    													'commentId' => params[:comment_id] })
		end

	    render json: response.data.to_json
	end

	def show
		render json: @response.data.to_json
	end

	def create
		# Creates a new reply to the given comment.
		reply = @drive.replies.insert.request_schema.new({
		    'content' => params[:content]
		})
		
		response = $client.execute( :api_method => @drive.replies.insert,
								    :body_object => reply,
								    :parameters => {'fileId' => params[:file_id],
								      				'commentId' => params[:comment_id] })

		render json: response.data.to_json
	end

	def update
		# Updates an existing reply.
		reply = @response.data
	    reply.content = params[:content]

	    result = $client.execute( :api_method => @drive.replies.update,
							      :body_object => reply,
							      :parameters => {'fileId' => params[:file_id],
      											'commentId' => params[:comment_id],
      											'replyId' => params[:id] })

	    render json: result.data.to_json
	end

	def destroy
		# Deletes a reply.
		response = $client.execute(:api_method => @drive.replies.delete,
							      :parameters => {'fileId' => params[:file_id],
      											'commentId' => params[:comment_id],
      											'replyId' => params[:id] })

	    render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@drive = $client.discovered_api('drive', 'v2')
	end

	def get_reply
    	# Gets a reply by ID.
		@response = $client.execute(:api_method => @drive.replies.get,
    								:parameters => {'fileId' => params[:file_id],
      												'commentId' => params[:comment_id],
      												'replyId' => params[:id] })
	end
end
