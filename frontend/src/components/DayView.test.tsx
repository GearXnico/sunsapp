import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DayView from "./DayView";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

describe("DayView", () => {
  it("shows the place, the zone, the date and the day length of the selected day", () => {
    render(<DayView data={sunCycle} selected={0} onSelect={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getByText("Showing Santiago, Región Metropolitana de Santiago, Chile")).toBeInTheDocument();
    expect(screen.getByText("America/Santiago · UTC−4 · 2026-06-21")).toBeInTheDocument();
    expect(screen.getByText("9 h 56 min")).toBeInTheDocument();
    expect(screen.queryByText(/vs\. previous day/)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-21/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Stages" })).toBeInTheDocument();
  });

  it("shows the change of day length against the previous day", () => {
    render(<DayView data={sunCycle} selected={1} onSelect={vi.fn()} />);

    expect(screen.getByText("No change vs. previous day")).toBeInTheDocument();
  });

  it("uses the offset of the selected day across a DST change", () => {
    render(<DayView data={sunCycleDstChange} selected={1} onSelect={vi.fn()} />);

    expect(screen.getByText("America/Santiago · UTC−3 · 2026-09-06")).toBeInTheDocument();
    expect(screen.getByText("+2 min vs. previous day")).toBeInTheDocument();
  });

  it("moves between days with Prev and Next, disabled at the ends of the range", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<DayView data={sunCycle} selected={0} onSelect={onSelect} />);

    expect(screen.getByRole("button", { name: "‹ Prev" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next ›" }));
    expect(onSelect).toHaveBeenLastCalledWith(1);

    rerender(<DayView data={sunCycle} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: "Next ›" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "‹ Prev" }));
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it("shows a dash for the day length of a polar night", () => {
    render(<DayView data={sunCyclePolarNight} selected={1} onSelect={vi.fn()} />);
    expect(screen.queryByText(/vs\. previous day/)).not.toBeInTheDocument();

    render(<DayView data={sunCyclePolarNight} selected={0} onSelect={vi.fn()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders nothing when the selected day does not exist", () => {
    const { container } = render(<DayView data={sunCycle} selected={5} onSelect={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
