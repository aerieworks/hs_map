class AddLocationToEvents < ActiveRecord::Migration
  def change
    change_table :events do |t|
      t.references :location, class_name: "ThingInstance", index: true
    end

    add_foreign_key :events, :thing_instances, column: :location_id
  end
end
