class CalendarsController < ApplicationController

	before_action :discover_api
	before_action :get_calendar, only: [:show, :update]

	def show
		render json: @response.data.to_json
	end

	def create
		# Creates a secondary calendar.
		calendar = {
		    'summary' => params[:summary],
		    'timeZone' => params[:time_zone]
		}

		response = $client.execute(:api_method => @calendar.calendars.insert,
		                        	:body => JSON.dump(calendar),
		                        	:headers => {'Content-Type' => 'application/json'})

		render json: response.data.to_json
	end

	def update
		# Updates metadata for a calendar.
		calendar = @response.data
		calendar.summary = params[:summary]
		calendar.description = params[:description]
		calendar.location = params[:location]
		calendar.timeZone = params[:timeZone]

		result = $client.execute(:api_method => @calendar.calendars.update,
		                        :parameters => {'calendarId' => calendar.id},
		                        :body_object => calendar,
		                        :headers => {'Content-Type' => 'application/json'})

		render json: result.data.to_json
	end

	def destroy
		# Deletes a secondary calendar.
		response = $client.execute(:api_method => @calendar.calendars.delete,
                        			:parameters => {'calendarId' => params[:id]})

		render json: response.data.to_json
	end

	def clear
		# Clears a secondary calendar. This operation deletes all data associated with the calendar and cannot be undone.
		response = $client.execute(:api_method => @calendar.calendars.clear,
                        			:parameters => {'calendarId' => params[:id]})

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
	    @calendar = $client.discovered_api('calendar', 'v3')
	end

	def get_calendar
		# Returns metadata for a calendar.
		@response = $client.execute(:api_method => @calendar.calendars.get,
                        			:parameters => {'calendarId' => params[:id]})
	end
end
