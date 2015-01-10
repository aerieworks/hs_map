class RemoveThingInstanceInitialLocation < ActiveRecord::Migration
  def up
    remove_foreign_key :thing_instances, column: :initial_location_id
    remove_reference :thing_instances, :initial_location
  end
end
