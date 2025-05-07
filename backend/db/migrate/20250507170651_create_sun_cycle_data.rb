class CreateSunCycleData < ActiveRecord::Migration[8.0]
  def change
    create_table :sun_cycle_data do |t|
      t.string :location
      t.date :start_date
      t.date :end_date
      t.time :sunrise
      t.time :sunset
      t.time :golden_hour
      t.float :lat
      t.float :long

      t.timestamps
    end
  end
end
