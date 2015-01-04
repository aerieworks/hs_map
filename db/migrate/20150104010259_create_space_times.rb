class CreateSpaceTimes < ActiveRecord::Migration
  def change
    create_table :space_times do |t|
      t.string :name, limit: 50, null: false

      t.timestamps null: false
    end
  end
end
