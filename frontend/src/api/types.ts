// GET /api/sun_cycle response (contract v3). Times are local to `timezone`, 24-hour "HH:MM",
// and may be null (polar day or night). `utc_offset` is minutes from UTC for that day.
export interface SunCycleDay {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  // Start of the evening golden hour
  golden_hour: string | null;
  utc_offset: number;
}

export interface SunCycleResponse {
  location: string;
  // Place the geocoder matched, for example "Santiago, Región Metropolitana de Santiago, Chile"; null if it sent none
  matched_place: string | null;
  // IANA time zone name, for example "America/Santiago"
  timezone: string;
  days: SunCycleDay[];
}

export interface SunCycleParams {
  location: string;
  start_date: string;
  end_date: string;
}
