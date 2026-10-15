# Index for SunCycle::Lookup, which reads the cache by rounded coordinates and date (ADR 0007).
class AddLookupIndexToSunCycleData < ActiveRecord::Migration[8.0]
  def change
    add_index :sun_cycle_data, [ :lat, :long, :start_date ]
  end
end
