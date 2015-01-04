class CreateSubEventSources < ActiveRecord::Migration
  def change
    create_table :sub_event_sources do |t|
      t.references :event, index: true, null: false
      t.string :source_panel, limit: 6, null: false

      t.timestamps null: false
    end
    add_foreign_key :sub_event_sources, :events
  end
end
