import { render } from "@testing-library/react";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { describe, expect, it, vi } from "vitest";
import ResultsChart from "./ResultsChart";
import { sunCycleDstChange } from "../test/fixtures";

const lineProps = vi.hoisted(() => ({
  current: undefined as undefined | { data: ChartData<"line">; options: ChartOptions<"line"> },
}));

vi.mock("react-chartjs-2", () => ({
  Line: (props: { data: ChartData<"line">; options: ChartOptions<"line"> }) => {
    lineProps.current = props;
    return <div data-testid="line-chart" />;
  },
}));

function renderChart() {
  render(<ResultsChart data={sunCycleDstChange} />);
  return lineProps.current!;
}

describe("ResultsChart", () => {
  it("passes the mapped days to the chart", () => {
    const { data } = renderChart();

    expect(data.labels).toEqual(["2026-09-05", "2026-09-06"]);
    expect(data.datasets.map((d) => d.label)).toContain("Golden hour (evening)");
  });

  it("uses a fixed 24-hour Y axis with ticks every 3 hours", () => {
    const y = renderChart().options.scales!.y as {
      min: number;
      max: number;
      ticks: { stepSize: number; callback: (value: number) => string };
      title: { text: string };
    };

    expect(y.min).toBe(0);
    expect(y.max).toBe(1440);
    expect(y.ticks.stepSize).toBe(180);
    expect([0, 180, 1440].map((v) => y.ticks.callback(v))).toEqual(["00:00", "03:00", "24:00"]);
    expect(y.title.text).toBe("Local time (America/Santiago)");
  });

  it("shows the time and the zone of that day in the tooltip", () => {
    const label = renderChart().options.plugins!.tooltip!.callbacks!.label as (
      item: TooltipItem<"line">,
    ) => string;
    const item = (dataIndex: number, y: number) =>
      ({ dataIndex, parsed: { x: dataIndex, y }, dataset: { label: "Sunrise" } }) as unknown as TooltipItem<"line">;

    expect(label(item(0, 441))).toBe("Sunrise: 07:21 America/Santiago (UTC−4)");
    expect(label(item(1, 500))).toBe("Sunrise: 08:20 America/Santiago (UTC−3)");
  });

  it("leaves the offset out of the tooltip when the API did not send it", () => {
    const days = sunCycleDstChange.days.map((day) => ({ ...day, utc_offset: null }));
    render(<ResultsChart data={{ ...sunCycleDstChange, days }} />);
    const label = lineProps.current!.options.plugins!.tooltip!.callbacks!.label as (
      item: TooltipItem<"line">,
    ) => string;

    const item = { dataIndex: 0, parsed: { x: 0, y: 441 }, dataset: { label: "Sunrise" } };

    expect(label(item as unknown as TooltipItem<"line">)).toBe("Sunrise: 07:21 America/Santiago");
  });
});
