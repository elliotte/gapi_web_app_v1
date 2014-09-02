class TaskListsController < ApplicationController

	before_action :discover_api
	before_action :get_task_list, only: [:show, :update, :destroy_show]

	def index
    	# Get the task lists.
    	response = $client.execute(:api_method => @tasks.tasklists.list)

    	render json: response.data.to_json
	end
    # "[name] [substring]"[/.*\[([^\]]*)/,1]
    # "test [1] sdfsdf [342424]".reverse.sub(/]\d+\[/,"").reverse
	def show
        respond_to do |format|
            format.html
            format.js { @task = @response.data }
        end
	end

	def create
    	tasklist = { title: "#{params[:task_list][:title]}[#{params[:task_list][:circle_id]}]" }

    	# Create the task list.
    	response = $client.execute(:api_method => @tasks.tasklists.insert,
    							:body_object => tasklist,
								:headers => {'Content-Type' => 'application/json'})

    	# render json: response.data.to_json
        redirect_to root_path
	end

	def update
    	tasklist = @response.data
    	tasklist.title = params[:task_list][:title]

    	# Update the task list.
    	result = $client.execute(:api_method => @tasks.tasklists.update,
    							:parameters => {'tasklist' => params[:id]},
    							:body_object => tasklist,
								:headers => {'Content-Type' => 'application/json'})

    	# render json: result.data.to_json
        redirect_to root_path
	end

	def destroy
    	# Delete the task list.
    	response = $client.execute(:api_method => @tasks.tasklists.delete,
    							:parameters => {'tasklist' => params[:id]})

    	# render json: response.data.to_json
        redirect_to root_path
	end

    def destroy_show
        respond_to do |format|
            format.html
            format.js { @task = @response.data }
        end
    end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@tasks = $client.discovered_api('tasks', 'v1')
	end

	def get_task_list
    	# Get the task list.
    	@response = $client.execute(:api_method => @tasks.tasklists.get,
    							:parameters => {'tasklist' => params[:id]})
	end
end
