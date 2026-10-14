import type { ChartData } from "chart.js";
import type { SunCycleDay } from "../api/types";
import { parseTime } from "./time";

const SERIES = [
  { key: "sunrise", label: "Sunrise", color: "#FFD88C" },
  { key: "sunset", label: "Sunset", color: "#5C84B9" },
  { key: "golden_hour", label: "Golden hour (evening)", color: "#F99E66" },
] as const;

// Map API days to Chart.js data: dates as labels, times as minutes since midnight.
// A missing or unparseable time becomes null and is drawn as a gap.
export function buildChartData(days: SunCycleDay[]): ChartData<"line", (number | null)[], string> {
  return {
    labels: days.map((day) => day.date),
    datasets: SERIES.map(({ key, label, color }) => ({
      label,
      data: days.map((day) => parseTime(day[key])),
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      spanGaps: false,
    })),
  };
}
