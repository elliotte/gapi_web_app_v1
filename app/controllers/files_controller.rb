class FilesController < ApplicationController

	before_action :discover_api
	before_action :get_file, only: [:show, :update]

	def index
    	# Get the list of files in drive
	    response = $client.execute(:api_method => @drive.files.list)

	    render json: response.data.to_json
	end

	def show
	    render json: @response.data.to_json
	end

	def create
		# Create the file in drive
	  	file = @drive.files.insert.request_schema.new({
	    	'title' => params[:file].original_filename,
    		'mimeType' => params[:file].content_type
	  	})

	  	media = Google::APIClient::UploadIO.new(params[:file].tempfile.path, params[:file].content_type)
	  	response = $client.execute(
	    	:api_method => @drive.files.insert,
	    	:body_object => file,
	    	:media => media,
	    	:parameters => {
	      		'uploadType' => 'multipart',
	      		'alt' => 'json'})

	    render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@drive = $client.discovered_api('drive', 'v2')
	end

	def get_file
    	# Get the file from drive
	    @response = $client.execute(:api_method => @drive.files.get,
    								:parameters => { 'fileId' => params[:id] })
	end
end
