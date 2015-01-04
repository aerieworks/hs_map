class RenameTimeToTimeLabel < ActiveRecord::Migration
  def change
    rename_table :times, :time_labels
  end
end
