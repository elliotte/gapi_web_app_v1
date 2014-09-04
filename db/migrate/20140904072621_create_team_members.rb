class CreateTeamMembers < ActiveRecord::Migration
  def change
    create_table :team_members do |t|
      t.integer :circle_id
      t.string :google_id

      t.timestamps
    end
  end
end
