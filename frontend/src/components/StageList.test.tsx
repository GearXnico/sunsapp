import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StageList from "./StageList";
import { dayStages } from "../lib/dayView";
import { sunCycle } from "../test/fixtures";

describe("StageList", () => {
  it("lists the stages between the nights with their start and end", () => {
    render(<StageList stages={dayStages(sunCycle.days[0]!)} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(7);
    expect(items[0]).toHaveTextContent("Twilight06:47–07:19First light to dawn");
    expect(within(items[3]!).getByText("Solar noon at 12:44")).toBeInTheDocument();
    expect(items[6]).toHaveTextContent("Twilight18:09–18:41Dusk to last light");
  });

  it("says so when there are no stages to list", () => {
    render(<StageList stages={[]} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/polar day or night/)).toBeInTheDocument();
  });
});
