class CirclesController < ApplicationController

	before_action :get_circle, except: [:index, :create]

	def index
		@circles = User.find_by(google_id: params[:user_google_id]).circles
    	respond_to do |format|
		  	format.html
		  	format.json { render json: @circles }
		end
	end

	def new
		@circle = Circle.new
	end

	def show
		respond_to do |format|
			format.html
	    	format.js { @circle }
    	end
	end

	def edit
		respond_to do |format|
	    	format.js { @circle }
    	end
	end

	def create
		circle = Circle.new(circle_params)
		circle.user_id = User.find_by(google_id: params[:circle][:user_id]).id
		if circle.save
			# render json: circle
			redirect_to circle_path(circle.id)
		else
			# render json: "Circle not saved"
			redirect_to root_path
		end
	end

	def update
		if @circle.update_attributes(circle_params)
			# render json: @circle
			redirect_to circle_path(@circle.id)
		else
			# render json: "Circle not updated"
			redirect_to root_path
		end
	end

	def destroy
		if @circle.destroy
			# render json: "Circle deleted"
			redirect_to root_path
		else
			# render json: "Circle not deleted"
			redirect_to root_path
		end
	end

	def destroy_show
		respond_to do |format|
	    	format.js { @circle }
    	end
	end

	private

	def get_circle
		@circle = Circle.find(params[:id])
	end

	def circle_params
   		params.require(:circle).permit(:display_name, :description)
 	end
end
