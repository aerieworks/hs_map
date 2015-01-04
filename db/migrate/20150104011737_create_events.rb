class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.references :space_time, index: true, null: false
      t.integer :sequence_index, null: false
      t.boolean :is_index_known, null: false
      t.string :when, limit: 50
      t.string :summary, limit: 50, null: false

      t.timestamps null: false
    end
    add_foreign_key :events, :space_times
  end
end
