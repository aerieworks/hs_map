class RenameIsIndexKnownToIsSequenceIndexKnown < ActiveRecord::Migration
  def change
    rename_column :event_participants, :is_index_known, :is_sequence_index_known
  end
end
