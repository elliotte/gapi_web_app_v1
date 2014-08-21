class CalendarsController < ApplicationController

	before_action :discover_api

	def show
		# Returns metadata for a calendar.
		response = $client.execute(:api_method => @calendar.calendars.get,
                        			:parameters => {'calendarId' => 'primary'})

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
	    @calendar = $client.discovered_api('calendar', 'v3')
	end
end
