import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { fetchSunCycle } from "./client";
import type { SunCycleResponse } from "./types";
import { sunCycle } from "../test/fixtures";

describe("fetchSunCycle", () => {
  it("calls the sun_cycle endpoint with the search params", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue({ data: sunCycle });
    const params = { location: "Santiago", start_date: "2026-06-21", end_date: "2026-06-22" };

    await expect(fetchSunCycle(params)).resolves.toEqual(sunCycle);
    expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/sun_cycle$/), { params });
  });

  it("returns the twilight and solar noon times of contract v3", async () => {
    // Same JSON as the backend controller test for Santiago on 2026-09-05.
    const body: SunCycleResponse = {
      location: "Santiago",
      matched_place: "Santiago, Región Metropolitana de Santiago, Chile",
      timezone: "America/Santiago",
      days: [
        {
          date: "2026-09-05",
          first_light: "05:56",
          dawn: "06:55",
          sunrise: "07:21",
          solar_noon: "13:06",
          golden_hour: "18:17",
          sunset: "18:51",
          dusk: "19:17",
          last_light: "20:16",
          utc_offset: -240,
        },
      ],
    };
    vi.spyOn(axios, "get").mockResolvedValue({ data: body });

    const params = { location: "Santiago", start_date: "2026-09-05", end_date: "2026-09-05" };
    const [day] = (await fetchSunCycle(params)).days;

    expect(day).toMatchObject({
      first_light: "05:56",
      dawn: "06:55",
      solar_noon: "13:06",
      dusk: "19:17",
      last_light: "20:16",
    });
  });
});
