import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DayView from "./DayView";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

describe("DayView", () => {
  it("shows the date, the day length, the sky and the key times of the selected day", () => {
    render(<DayView data={sunCycle} selected={0} onSelect={vi.fn()} />);

    expect(screen.getByText("2026-06-21")).toBeInTheDocument();
    expect(screen.getByText("9 h 56 min")).toBeInTheDocument();
    expect(screen.queryByText(/vs\. previous day/)).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-21/ })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Key times" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Stages" })).not.toBeInTheDocument();
  });

  it("shows the change of day length against the previous day", () => {
    render(<DayView data={sunCycle} selected={1} onSelect={vi.fn()} />);

    expect(screen.getByText("No change", { exact: false })).toHaveTextContent("No change vs. previous day");
  });

  it("measures the day length change across a DST change", () => {
    render(<DayView data={sunCycleDstChange} selected={1} onSelect={vi.fn()} />);

    expect(screen.getByText("+2 min", { exact: false })).toHaveTextContent("+2 min vs. previous day");
  });

  it("moves between days with Prev and Next, disabled at the ends of the range", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<DayView data={sunCycle} selected={0} onSelect={onSelect} />);

    expect(screen.getByRole("button", { name: "Previous day" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Next day" }));
    expect(onSelect).toHaveBeenLastCalledWith(1);

    rerender(<DayView data={sunCycle} selected={1} onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: "Next day" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Previous day" }));
    expect(onSelect).toHaveBeenLastCalledWith(0);
  });

  it("shows a dash for the day length of a polar night", () => {
    const { unmount } = render(<DayView data={sunCyclePolarNight} selected={1} onSelect={vi.fn()} />);
    expect(screen.queryByText(/vs\. previous day/)).not.toBeInTheDocument();
    unmount();

    render(<DayView data={sunCyclePolarNight} selected={0} onSelect={vi.fn()} />);
    expect(screen.getByText("Day length", { exact: false })).toHaveTextContent("Day length —");
  });

  it("renders nothing when the selected day does not exist", () => {
    const { container } = render(<DayView data={sunCycle} selected={5} onSelect={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
