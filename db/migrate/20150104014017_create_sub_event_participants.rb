class CreateSubEventParticipants < ActiveRecord::Migration
  def change
    create_table :sub_event_participants do |t|
      t.references :event, index: true, null: false
      t.references :thing_instance, index: true, null: false

      t.timestamps null: false
    end
    add_foreign_key :sub_event_participants, :events
    add_foreign_key :sub_event_participants, :thing_instances
  end
end
