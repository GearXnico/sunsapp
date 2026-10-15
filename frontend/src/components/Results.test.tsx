import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Results from "./Results";
import { sunCycleDays } from "../test/fixtures";

vi.mock("./ResultsChart", () => ({ default: () => <div data-testid="results-chart" /> }));

describe("Results", () => {
  it("shows the location, the chart and one row per day", () => {
    render(<Results data={sunCycleDays} />);

    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getByTestId("results-chart")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 days
    expect(rows[1]).toHaveTextContent("2026-06-2107:4617:4217:05");
  });
});
