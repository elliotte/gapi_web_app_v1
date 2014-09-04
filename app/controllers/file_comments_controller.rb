class FileCommentsController < ApplicationController

	before_action :discover_api
	before_action :get_comment, only: [:show, :update]

	def index
    	# Lists a file's comments.
    	if params[:page_token].present?
		    @response = $client.execute(:api_method => @drive.comments.list,
    									:parameters => {'fileId' => params[:file_id],
		                            					'pageToken' => params[:page_token]})
		else
			@response = $client.execute(:api_method => @drive.comments.list,
    									:parameters => {'fileId' => params[:file_id]})
		end

	    render json: @response.data.to_json
	end

	def comments_show
    	# Lists a file's comments.
    	if params[:page_token].present?
		    response = $client.execute(:api_method => @drive.comments.list,
    									:parameters => {'fileId' => params[:file_id],
		                            					'pageToken' => params[:page_token]})
		else
			response = $client.execute(:api_method => @drive.comments.list,
    									:parameters => {'fileId' => params[:file_id]})
		end

	    respond_to do |format|
	      	format.js { @comments = response.data.items }
	    end
	end

	def show
	    render json: @response.data.to_json
	end

	def create
		# Creates a new comment on the given file.
		comment = @drive.comments.insert.request_schema.new({
		    'content' => params[:content]
		})

		response = $client.execute(
			:api_method => @drive.comments.insert,
		    :body_object => comment,
		    :parameters => { 'fileId' => params[:file_id] })

		render json: response.data.to_json
	end

	def update
		# Updates an existing comment.
		comment = @response.data
	    comment.content = params[:content]

	    result = $client.execute(
	      	:api_method => @drive.comments.update,
	      	:body_object => comment,
	      	:parameters => {'fileId' => params[:file_id],
	        				'commentId' => params[:id] })

	    render json: result.data.to_json
	end

	def destroy
		# Deletes a comment.
		response = $client.execute(
		    :api_method => @drive.comments.delete,
		    :parameters => {'fileId' => params[:file_id],
		      				'commentId' => params[:id] })

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@drive = $client.discovered_api('drive', 'v2')
	end

	def get_comment
    	# Gets a comment by ID.
		@response = $client.execute(:api_method => @drive.comments.get,
    								:parameters => {'fileId' => params[:file_id],
      												'commentId' => params[:id]})
	end
end
