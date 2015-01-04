class RenameSubEventParticipantToEventParticipant < ActiveRecord::Migration
  def change
    rename_table :sub_event_participants, :event_participants
  end
end
