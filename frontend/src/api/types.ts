// One day of the current GET /api/sun_cycle response. All values come back as strings.
export interface SunCycleDay {
  location: string;
  start_date: string;
  end_date: string;
  sunrise: string;
  sunset: string;
  golden_hour: string;
}

export interface SunCycleParams {
  location: string;
  start_date: string;
  end_date: string;
}
