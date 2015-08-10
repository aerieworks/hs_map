class AddDistanceToTimelinePoint < ActiveRecord::Migration
  def change
    add_column :timeline_points, :previous_distance, :integer
    add_column :timeline_points, :next_distance, :integer
    add_column :timeline_points, :order, :integer
  end
end
