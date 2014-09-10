class PeoplesController < ApplicationController

	before_action :discover_api

	def index
    	# Get the list of people.
	    @response = $client.execute!(@plus.people.list,
	                                :collection => 'visible',
	                                :userId => 'me')

	    respond_to do |format|
	      	format.html
	      	format.js { @peoples = @response.data }
	    end
	    # render json: JSON.parse(@response).to_json
	end

	def show
	    # Get a person's profile.
	    response = $client.execute!(@plus.people.get,
	                                :userId => params[:id]).body

	    render json: JSON.parse(response).to_json
	end

	def search
		# Search all public profiles.
		if params[:next_page_token].present?
		    response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 10,
		                                'pageToken' => params[:next_page_token]}).body
		else
			response = $client.execute!(@plus.people.search,
		                                {'query' => params[:query],
		                                'maxResults' => 10}).body
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

	def circle_peoples
		@team_members = Circle.find(params[:id]).team_members
		render json: @team_members
	end

	def add_people
		if params[:google_id].present?
			params[:google_id].each do |google_id|
				unless TeamMember.find_by(circle_id: params[:circle_id], google_id: google_id).present?
					team_member = TeamMember.create(circle_id: params[:circle_id], google_id: google_id)
					user = User.find_by(google_id: google_id)
					if user
						drive = $client.discovered_api('drive', 'v2')
						teamfiles = team_member.circle.team_files
			            if teamfiles
			              	teamfiles.each do |teamfile|
				                new_permission = drive.permissions.insert.request_schema.new({
				                  	'value' => user.email,
				                  	'type' => "user",
				                  	'role' => "reader"
				                })

			                	result = $client.execute(:api_method => drive.permissions.insert,
			                        :body_object => new_permission,
			                        :parameters => { 'fileId' => teamfile.file_id })
			              	end
			            end
			        end
				end
			end
		end
		redirect_to circle_path(params[:circle_id])
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@plus = $client.discovered_api('plus', 'v1')
	end
end
