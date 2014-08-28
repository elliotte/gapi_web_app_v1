class CreateCircles < ActiveRecord::Migration
  def change
    create_table :circles do |t|
      t.string :display_name
      t.text :description

      t.timestamps
    end
  end
end
