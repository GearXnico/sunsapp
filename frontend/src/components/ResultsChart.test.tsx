import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResultsChart from "./ResultsChart";
import { sunCycleDays } from "../test/fixtures";

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: { data: { labels: string[]; datasets: { label: string; data: unknown[] }[] } }) => (
    <pre data-testid="line-chart">{JSON.stringify(data)}</pre>
  ),
}));

describe("ResultsChart", () => {
  it("passes dates as labels and times as minutes to the chart", () => {
    render(<ResultsChart data={sunCycleDays} />);

    const data = JSON.parse(screen.getByTestId("line-chart").textContent ?? "{}");
    expect(data.labels).toEqual(["2026-06-21", "2026-06-22"]);
    expect(data.datasets.map((d: { label: string }) => d.label)).toEqual([
      "Sunrise",
      "Sunset",
      "Golden Hour",
    ]);
    expect(data.datasets[0].data).toEqual([466, 467]);
  });
});
