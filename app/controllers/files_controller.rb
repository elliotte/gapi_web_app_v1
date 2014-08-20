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

	def update
	    file = @response.data

	    file.title = params[:title] if params[:title].present?
	    file.description = params[:description] if params[:description].present?
	    file.mime_type = params[:mime_type] if params[:mime_type].present?

	    media = Google::APIClient::UploadIO.new(params[:file].tempfile.path, params[:file].content_type)

	    result = $client.execute(
	      	:api_method => @drive.files.update,
	      	:body_object => file,
	      	:media => media,
	      	:parameters => { 'fileId' => file.id,
	                       'newRevision' => false,
	                       'uploadType' => 'multipart',
	                       'alt' => 'json' })

	    render json: result.data.to_json
	end

	def destroy
		# Delete the file from drive
	    response = $client.execute(:api_method => @drive.files.delete,
    							:parameters => { 'fileId' => params[:id] })

	    render json: response.data.to_json
	end

	def copy
		# Creates a copy of the specified file.
		copied_file = @drive.files.copy.request_schema.new({ 'title' => params[:title] })

		response = $client.execute(
		    :api_method => @drive.files.copy,
		    :body_object => copied_file,
		    :parameters => { 'fileId' => params[:id] })

		render json: response.data.to_json
	end

	def touch
		# Set the file's updated time to the current server time. Update a file's modified date.
		response = $client.execute(:api_method => @drive.files.touch,
    							:parameters => { 'fileId' => params[:id] })

	    render json: response.data.to_json
	end

	def trash
		# Moves a file to the trash.
		response = $client.execute(:api_method => @drive.files.trash,
    							:parameters => { 'fileId' => params[:id] })

	    render json: response.data.to_json
	end

	def untrash
		# Restores a file from the trash.
		response = $client.execute(:api_method => @drive.files.untrash,
    							:parameters => { 'fileId' => params[:id] })

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
