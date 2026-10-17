import { describe, expect, it } from "vitest";
import type { SunCycleResponse } from "../api/types";
import { buildCsv, csvFileName } from "./csv";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

const lines = (csv: string) => csv.split("\r\n");

const withDay = (overrides: Partial<SunCycleResponse["days"][number]>): SunCycleResponse => ({
  ...sunCycle,
  days: [{ date: "2026-06-21", sunrise: "07:46", sunset: "17:42", golden_hour: "17:05", utc_offset: -240, ...overrides }],
});

describe("buildCsv", () => {
  it("writes a header and one CRLF-terminated row per day", () => {
    expect(buildCsv(sunCycle)).toBe(
      "date,sunrise,sunset,golden_hour,utc_offset\r\n" +
        "2026-06-21,07:46,17:42,17:05,-240\r\n" +
        "2026-06-22,07:47,17:43,17:06,-240\r\n",
    );
  });

  it("keeps the offset of each day across a DST change", () => {
    expect(lines(buildCsv(sunCycleDstChange)).slice(1, 3)).toEqual([
      "2026-09-05,07:21,18:39,18:04,-240",
      "2026-09-06,08:20,19:40,19:05,-180",
    ]);
  });

  it("writes missing times as empty cells", () => {
    expect(lines(buildCsv(sunCyclePolarNight))[1]).toBe("2027-01-14,,,,60");
  });

  it("quotes cells with commas, quotes or line breaks (RFC 4180)", () => {
    expect(lines(buildCsv(withDay({ sunrise: "a,b" })))[1]).toContain(',"a,b",');
    expect(lines(buildCsv(withDay({ sunrise: 'say "hi"' })))[1]).toContain(',"say ""hi""",');
    expect(buildCsv(withDay({ sunrise: "line\nbreak" }))).toContain(',"line\nbreak",');
  });

  it.each(["=1+1", "+1", "-1", "@SUM(A1)", "\tx", "\rx"])(
    "escapes text starting with a formula character: %j",
    (value) => {
      const cell = lines(buildCsv(withDay({ date: value })))[1]?.split(",")[0];
      expect(cell?.replace(/^"/, "")).toMatch(/^'/);
    },
  );

  it("escapes and quotes a formula that also needs quoting", () => {
    expect(lines(buildCsv(withDay({ date: '=HYPERLINK("x")' })))[1]).toMatch(/^"'=HYPERLINK\(""x""\)",/);
  });

  it("leaves negative numbers as numbers", () => {
    expect(lines(buildCsv(withDay({ utc_offset: -180 })))[1]).toMatch(/,-180$/);
  });
});

describe("csvFileName", () => {
  it("includes the time zone and the date range", () => {
    expect(csvFileName(sunCycle)).toBe("sunsapp-america-santiago-2026-06-21-2026-06-22.csv");
  });

  it("slugs zones with odd characters and handles no days", () => {
    expect(csvFileName({ location: "x", timezone: "America/Argentina/Buenos_Aires", days: [] })).toBe(
      "sunsapp-america-argentina-buenos-aires.csv",
    );
  });
});
