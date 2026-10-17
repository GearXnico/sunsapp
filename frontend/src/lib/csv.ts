import type { SunCycleResponse } from "../api/types";

// CSV export of the results (ADR 0015). RFC 4180: comma separator, CRLF line endings and
// double quotes around any cell that holds a comma, a quote or a line break.
const HEADER = ["date", "sunrise", "sunset", "golden_hour", "utc_offset"];

// Text cells starting with one of these could run as a formula in a spreadsheet, so they get
// a leading apostrophe (OWASP CSV injection). Numbers are written as numbers: utc_offset is a
// number from the API (for example -180), never text, so a negative offset stays a number.
const FORMULA_START = /^[=+\-@\t\r]/;

type Cell = string | number | null;

const formatCell = (value: Cell): string => {
  if (value === null) return "";
  if (typeof value === "number") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// Build the CSV text for the current results. Missing times (polar day or night) are empty cells.
export const buildCsv = (data: SunCycleResponse): string => {
  const rows: Cell[][] = [
    HEADER,
    ...data.days.map((day) => [day.date, day.sunrise, day.sunset, day.golden_hour, day.utc_offset]),
  ];
  return rows.map((row) => row.map(formatCell).join(",")).join("\r\n") + "\r\n";
};

// File name with the time zone the times are in, for example
// "sunsapp-america-santiago-2026-06-21-2026-06-22.csv".
export const csvFileName = (data: SunCycleResponse): string => {
  const zone = data.timezone.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const first = data.days[0]?.date ?? "";
  const last = data.days[data.days.length - 1]?.date ?? "";
  return `${["sunsapp", zone, first, last].filter(Boolean).join("-")}.csv`;
};
