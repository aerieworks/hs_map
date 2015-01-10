class ChangeEventParticipantsIntoEventExperiences < ActiveRecord::Migration
  def up
    remove_foreign_key :event_participants, column: :location_id
    remove_foreign_key :event_participants, :thing_instances
    remove_column :event_participants, :is_local_time_known
    remove_column :event_participants, :local_time
    remove_column :event_participants, :is_sequence_index_known
    remove_column :event_participants, :sequence_index
    remove_reference :event_participants, :location
    remove_reference :event_participants, :thing_instance

    rename_table :event_participants, :event_experiences
    change_table :event_experiences do |t|
      t.references :timeline_point, index: true
    end
    add_foreign_key :event_experiences, :timeline_points
  end
end
