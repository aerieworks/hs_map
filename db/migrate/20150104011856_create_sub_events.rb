class CreateSubEvents < ActiveRecord::Migration
  def change
    create_table :sub_events do |t|
      t.references :event, index: true, null: false
      t.string :description, limit: 1000, null: false

      t.timestamps null: false
    end
    add_foreign_key :sub_events, :events
  end
end
