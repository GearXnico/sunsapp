import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KeyTimes from "./KeyTimes";
import { sunCycle, sunCyclePolarNight } from "../test/fixtures";

describe("KeyTimes", () => {
  it("shows the six key moments of the day in order, with gold badges for the sun ones", () => {
    const { container } = render(<KeyTimes day={sunCycle.days[0]!} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "First light06:47",
      "Sunrise07:46",
      "Solar noon12:44",
      "Golden hour17:05",
      "Sunset17:42",
      "Last light18:41",
    ]);
    expect(container.querySelectorAll(".badge-gold")).toHaveLength(3);
    expect(container.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(6);
  });

  it("shows a dash for the moments the API did not send", () => {
    render(<KeyTimes day={sunCyclePolarNight.days[0]!} />);

    expect(screen.getAllByText("—")).toHaveLength(5);
    expect(screen.getByText("12:10")).toBeInTheDocument();
  });
});
