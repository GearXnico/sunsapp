# Second step of the two-PR removal (ADR 0017): the table has been unused since the cache moved to Rails.cache.
class DropSunCycleData < ActiveRecord::Migration[8.1]
  def change
    drop_table :sun_cycle_data do |t|
      t.string :location
      t.date :start_date
      t.date :end_date
      t.string :sunrise
      t.string :sunset
      t.string :golden_hour
      t.float :lat
      t.float :long
      t.timestamps
      t.string :timezone
      t.integer :utc_offset
      t.index [ :lat, :long, :start_date ]
    end
  end
end
