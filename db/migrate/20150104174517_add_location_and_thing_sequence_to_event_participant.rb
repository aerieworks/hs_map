class AddLocationAndThingSequenceToEventParticipant < ActiveRecord::Migration
  def change
    change_table :event_participants do |t|
      t.integer :sequence_index, index: true, null: false
      t.boolean :is_index_known, null: false
      t.references :location, class_name: 'ThingInstance', index: true
      t.integer :local_time, index: true, null: false
      t.boolean :is_local_time_known, null: false
    end
    add_foreign_key :event_participants, :thing_instances, column: :location_id

    create_table :times do |t|
      t.references :space_time, null: false
      t.integer :sequence_index, null: false
      t.string :description, limit: 50, null: false
    end
    add_foreign_key :times, :space_times
    add_index :times, [:space_time_id, :sequence_index], unique: true

    reversible do |dir|
      dir.up do
        remove_foreign_key :events, column: :location_id
        remove_foreign_key :events, :space_times
        remove_column :events, :location_id
        remove_column :events, :when
        remove_column :events, :is_index_known
        remove_column :events, :sequence_index
        remove_column :events, :space_time_id
      end
      dir.down do
        change_table :events do |t|
          t.references :space_time, index: true
          t.integer :sequence_index, null: false
          t.boolean :is_index_known, null: false
          t.string :when, limit: 50
          t.references :location, class_name: "ThingInstance", index: true
        end
        add_foreign_key :events, :space_times
        add_foreign_key :events, :thing_instances, column: :location_id
      end
    end
  end
end
