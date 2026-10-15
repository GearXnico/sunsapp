import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { fetchSunCycle } from "./client";
import { sunCycle } from "../test/fixtures";

describe("fetchSunCycle", () => {
  it("calls the sun_cycle endpoint with the search params", async () => {
    const get = vi.spyOn(axios, "get").mockResolvedValue({ data: sunCycle });
    const params = { location: "Santiago", start_date: "2026-06-21", end_date: "2026-06-22" };

    await expect(fetchSunCycle(params)).resolves.toEqual(sunCycle);
    expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/api\/sun_cycle$/), { params });
  });
});
