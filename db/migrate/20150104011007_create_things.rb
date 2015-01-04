class CreateThings < ActiveRecord::Migration
  def change
    create_table :things do |t|
      t.string :name, limit: 50, null: false
      t.integer :category, null: false

      t.timestamps null: false
    end
  end
end
