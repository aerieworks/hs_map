class CreateThingInstances < ActiveRecord::Migration
  def change
    create_table :thing_instances do |t|
      t.references :thing, index: true, null: false
      t.references :space_time, index: true, null: false

      t.timestamps null: false
    end
    add_foreign_key :thing_instances, :things
    add_foreign_key :thing_instances, :space_times
  end
end
