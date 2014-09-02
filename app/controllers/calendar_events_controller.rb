class CalendarEventsController < ApplicationController

  before_action :discover_api
  before_action :get_event, only: [:show, :update, :destroy_show]

	def index
    # Get the list of calendar events.
    response = $client.execute(:api_method => @calendar.events.list,
                              :parameters => {'calendarId' => params[:calendar_id]})

    render json: response.data.to_json
  end

  def show
    respond_to do |format|
      format.html
	    format.js { @event = @response.data }
    end
  end

  def new
    respond_to do |format|
      format.html
      format.js
    end
  end

  def create
    # Creates an event.
    event = {
      'summary' => params[:event][:summary],
      'location' => params[:event][:location],
      'description' => params[:event][:description],
      'start' => {
        'dateTime' => params[:event][:start_time].to_datetime
      },
      'end' => {
        'dateTime' => params[:event][:end_time].to_datetime
      },
      'attendees' => [
        {
          'email' => params[:event][:attendee_email],
          'displayName' => params[:event][:attendee_name]
        }
      ],
      "extendedProperties" => {
        "private" => {
          "circle_id" => params[:event][:circle_id]
        }
      },
      'status' => params[:event][:status],
      'visibility' => params[:event][:visibility]
    }

    response = $client.execute(:api_method => @calendar.events.insert,
                              :parameters => {'calendarId' => params[:calendar_id]},
                              :body => JSON.dump(event),
                              :headers => {'Content-Type' => 'application/json'})

    # render json: response.data.to_json
    redirect_to root_path
  end

  def quick_add
    # Creates an quick event.
    response = $client.execute(:api_method => @calendar.events.quick_add,
                              :parameters => {'calendarId' => params[:calendar_id],
                                              'text' => params[:event][:text]})

    # render json: response.data.to_json
    redirect_to root_path
  end

  def update
    # Updates an event.
    event = @response.data

    event.summary = params[:event][:summary] if params[:event][:summary].present? # Title of the event (string)
    event.start.dateTime = params[:event][:start_time].to_datetime if params[:event][:start_time].present? # Start Time of the event(datetime)
    event.end.dateTime = params[:event][:end_time].to_datetime if params[:event][:end_time].present? # End Time of the event(datetime)
    event.location = params[:event][:location] if params[:event][:location].present? # Geographic location of the event (string)
    event.description = params[:event][:description] if params[:event][:description].present? # Description of the event (string)
    event.status = params[:event][:status] if params[:event][:status].present? # Status of the event (string) : "confirmed" - The event is confirmed. This is the default status, "tentative" - The event is tentatively confirmed, "cancelled" - The event is cancelled.
    event.colorId = params[:event][:colorId] if params[:event][:colorId].present? # 1-11 (string)
    event.visibility = params[:event][:visibility] if params[:event][:visibility].present? # Visibility of the event (string) : "default" - Uses the default visibility for events on the calendar. This is the default value, "public" - The event is public and event details are visible to all readers of the calendar, "private" - The event is private and only event attendees may view event details, "confidential" - The event is private. This value is provided for compatibility reasons.

    if event.attendees.present?
	    if params[:event][:attendee_email]
	    	params[:event][:attendee_email].each_with_index do |attendee, index|
	    	  event.attendees[index].email = params[:event][:attendee_email][index] # The attendee's email address, if available (string). This field must be present when adding an attendee.
        end
      end
      if params[:event][:attendee_name]
        params[:event][:attendee_name].each_with_index do |attendee, index|
          event.attendees[index].displayName = params[:event][:attendee_name][index] # The attendee's name (string)
        end
	    end
	    if params[:event][:attendee_response_status]
        params[:event][:attendee_response_status].each_with_index do |attendee, index|
          event.attendees[index].responseStatus = params[:event][:attendee_response_status][index] # The attendee's response status (string) : "needsAction" - The attendee has not responded to the invitation, "declined" - The attendee has declined the invitation, "tentative" - The attendee has tentatively accepted the invitation, "accepted" - The attendee has accepted the invitation.
	    	end
      end
    end

    result = $client.execute(:api_method => @calendar.events.update,
                            :parameters => {'calendarId' => params[:calendar_id], 'eventId' => event.id},
                            :body_object => event,
                            :headers => {'Content-Type' => 'application/json'})
    
    # render json: result.data.to_json
    redirect_to root_path
  end

  def destroy
    # Deletes an event.
    response = $client.execute(:api_method => @calendar.events.delete,
                              :parameters => {'calendarId' => params[:calendar_id], 'eventId' => params[:id]})

    # render json: response.data.to_json
    redirect_to root_path
  end

  def destroy_show
    respond_to do |format|
      format.html
      format.js { @event = @response.data }
    end
  end

  def move
    # Moves an event to another calendar, i.e. changes an event's organizer.
    response = $client.execute(:api_method => @calendar.events.move,
                              :parameters => {'calendarId' => params[:calendar_id], 'eventId' => params[:id],
                                              'destination' => params[:destination_calendar_id]})

    render json: response.data.to_json
  end

  private

  def discover_api
    # Authorizing the client and constructing a Google+ service.
    @calendar = $client.discovered_api('calendar', 'v3')
  end

  def get_event
    # Get the event.
    @response = $client.execute(:api_method => @calendar.events.get,
                                :parameters => {'calendarId' => params[:calendar_id], 'eventId' => params[:id]})
  end
end
