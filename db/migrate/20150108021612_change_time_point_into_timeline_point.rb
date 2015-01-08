class ChangeTimePointIntoTimelinePoint < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.up do
        remove_foreign_key :time_points, :space_times
      end
      dir.down do
        add_foreign_key :time_points, :space_times
      end
    end

    remove_reference :time_points, :space_time
    rename_table :time_points, :timeline_points
    change_table :timeline_points do |t|
      t.references :thing_instance, index: true
      t.references :when_and_where, class_name: 'TimelinePoint', index: true
    end
    add_foreign_key :timeline_points, :thing_instances
    add_foreign_key :timeline_points, :timeline_points, column: :when_and_where_id
  end
end
