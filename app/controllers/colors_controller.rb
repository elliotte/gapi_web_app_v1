class ColorsController < ApplicationController

	before_action :discover_api, :get_colors

	def calendar
		render json: @response.data.calendar.to_json
	end

	def event
		render json: @response.data.event.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
	    @calendar = $client.discovered_api('calendar', 'v3')
	end

	def get_colors
		# Returns the color definitions for calendars and events.
		@response = $client.execute(:api_method => @calendar.colors.get)
	end
end
