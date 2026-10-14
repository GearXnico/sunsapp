import { describe, expect, it } from "vitest";
import type { SunCycleDay } from "../api/types";
import { buildChartData } from "./chartData";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

const series = (data: ReturnType<typeof buildChartData>) => data.datasets.map((d) => d.data);

describe("buildChartData", () => {
  it("uses dates as labels and local times as minutes since midnight", () => {
    const data = buildChartData(sunCycle.days);

    expect(data.labels).toEqual(["2026-06-21", "2026-06-22"]);
    expect(data.datasets.map((d) => d.label)).toEqual(["Sunrise", "Sunset", "Golden hour (evening)"]);
    expect(series(data)).toEqual([
      [466, 467],
      [1062, 1063],
      [1025, 1026],
    ]);
  });

  it("keeps the current colors", () => {
    const colors = buildChartData(sunCycle.days).datasets.map((d) => d.borderColor);
    expect(colors).toEqual(["#FFD88C", "#5C84B9", "#F99E66"]);
  });

  it("turns null times into gaps instead of joining the points", () => {
    const data = buildChartData(sunCyclePolarNight.days);

    expect(series(data)).toEqual([
      [null, 708],
      [null, 753],
      [null, 710],
    ]);
    expect(data.datasets.every((d) => d.spanGaps === false)).toBe(true);
  });

  it("plots the local time on both sides of a DST change", () => {
    expect(series(buildChartData(sunCycleDstChange.days))[0]).toEqual([441, 500]);
  });

  it("never produces NaN for unexpected formats", () => {
    const day: SunCycleDay = {
      date: "2026-06-21",
      sunrise: "7:46:00 AM",
      sunset: "2026-06-21T17:42:00-04:00",
      golden_hour: "17:05",
      utc_offset: -240,
    };

    expect(series(buildChartData([day]))).toEqual([[null], [null], [1025]]);
  });
});
