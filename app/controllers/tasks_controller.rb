class TasksController < ApplicationController

	before_action :discover_api
	before_action :get_task, only: [:show, :update, :complete_task]

	def index
    	# Get the list of tasks in task list.
    	response = $client.execute(:api_method => @tasks.tasks.list,
								:parameters => {'tasklist' => params[:task_list_id]})

    	render json: response.data.to_json
	end

	def show
    	render json: @response.data.to_json
	end

	def create
    	task = { 
    			title: params[:task][:title] ,
    			notes: params[:task][:notes] ,
    			due: params[:task][:due].to_datetime
				}

    	# Create the task in task list.
    	response = $client.execute(:api_method => @tasks.tasks.insert,
    							:parameters => {'tasklist' => params[:task_list_id]},
    							:body_object => task,
								:headers => {'Content-Type' => 'application/json'})

    	render json: response.data.to_json
	end

	def update
    	task = @response.data
    	task.title = params[:task][:title]
    	task.notes = params[:task][:notes]
    	task.due = params[:task][:due].to_datetime
    	task.status = params[:task][:status]

    	# Update the task in task list.
    	result = $client.execute(:api_method => @tasks.tasks.update,
    							:parameters => {'tasklist' => params[:task_list_id], 'task' => params[:id]},
    							:body_object => task,
								:headers => {'Content-Type' => 'application/json'})

    	render json: result.data.to_json
	end

	def destroy
    	# Delete the task in task list.
    	response = $client.execute(:api_method => @tasks.tasks.delete,
    							:parameters => {'tasklist' => params[:task_list_id], 'task' => params[:id]})

    	render json: response.data.to_json
	end

	def complete_task
		task = @response.data
		task.status = 'completed'

		# Update the task with status as complete
		result = $client.execute(:api_method => @tasks.tasks.update,
		                        :parameters => {'tasklist' => params[:task_list_id], 'task' => params[:id]},
		                        :body_object => task,
		                        :headers => {'Content-Type' => 'application/json'})

		render json: result.data.to_json
	end

	# Clears all completed tasks from the specified task list. The affected tasks will be marked as 'hidden' and no longer be returned by default when retrieving all tasks for a task list.
	def clear
		# Get the task with tasklist id and task id.
		response = $client.execute(:api_method => @tasks.tasks.clear,
		                          :parameters => {'tasklist' => params[:task_list_id]})

		render json: response.data.to_json
	end

	private

	def discover_api
		# Authorizing the client and constructing a Google+ service.
		@tasks = $client.discovered_api('tasks', 'v1')
	end

	def get_task
    	# Get the task in task list.
    	@response = $client.execute(:api_method => @tasks.tasks.get,
    							:parameters => {'tasklist' => params[:task_list_id], 'task' => params[:id]})
	end
end
