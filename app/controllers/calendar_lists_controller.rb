class CalendarListsController < ApplicationController

	before_action :discover_api
	before_action :get_entry, only: [:show, :update]

	def index
		# Returns entries on the user's calendar list.
	    response = $client.execute(:api_method => @calendar.calendar_list.list)

	    render json: response.data.to_json
	end

	def show
		render json: @response.data.to_json
	end

	def create
		# Adds an entry to the user's calendar list.
		entry = {
		  'id' => 'calendarId'
		}

		response = $client.execute(:api_method => @calendar.calendar_list.insert,
		                        :body => JSON.dump(entry),
		                        :headers => {'Content-Type' => 'application/json'})

		render json: response.data.to_json
	end

	def update
		# Updates an entry on the user's calendar list.
		calendar_list_entry = @response.data
		calendar_list_entry.colorId = params[:color_id]

		result = $client.execute(:api_method => @calendar.calendar_list.update,
		                        :parameters => {'calendarId' => calendar_list_entry.id},
		                        :body_object => calendar_list_entry,
		                        :headers => {'Content-Type' => 'application/json'})

		render json: result.data.to_json
	end

	def destroy
		# Deletes an entry on the user's calendar list.
		response = $client.execute(:api_method => @calendar.calendar_list.delete,
                        			:parameters => {'calendarId' => params[:id]})

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
	    @calendar = $client.discovered_api('calendar', 'v3')
	end

	def get_entry
	    # Get an entry on the user's calendar list.
	    @response = $client.execute(:api_method => @calendar.calendar_list.get,
                        			:parameters => {'calendarId' => params[:id]})
	end
end
