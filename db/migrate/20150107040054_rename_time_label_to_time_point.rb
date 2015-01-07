class RenameTimeLabelToTimePoint < ActiveRecord::Migration
  def change
    reversible do |dir|
      dir.up do
        add_index :time_labels, :space_time_id
        remove_index :time_labels, [:space_time_id, :sequence_index]
        remove_column :time_labels, :sequence_index
      end
      dir.down do
        add_column :time_labels, :sequence_index, :integer
        add_index :time_labels, [:space_time_id, :sequence_index], unique: true
        remove_index :time_labels, :space_time_id
      end
    end

    rename_table :time_labels, :time_points
    change_column_null :time_points, :description, true
    add_reference :time_points, :previous, class_name: 'TimeLabel', index: true
    add_reference :time_points, :next, class_name: 'TimeLabel', index: true
    add_foreign_key :time_points, :time_points, column: :previous_id
    add_foreign_key :time_points, :time_points, column: :next_id
  end
end
