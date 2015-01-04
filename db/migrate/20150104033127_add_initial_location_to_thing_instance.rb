class AddInitialLocationToThingInstance < ActiveRecord::Migration
  def change
    change_table :thing_instances do |t|
      t.references :initial_location, class_name: "ThingInstance", index: true
    end

    add_foreign_key :thing_instances, :thing_instances, column: :initial_location_id
  end
end
