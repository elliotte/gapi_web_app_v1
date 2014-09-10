class CreateTeamFiles < ActiveRecord::Migration
  def change
    create_table :team_files do |t|
      t.integer :circle_id
      t.string :file_id

      t.timestamps
    end
  end
end
