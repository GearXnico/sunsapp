import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ExportCsvButton from "./ExportCsvButton";
import { buildCsv } from "../lib/csv";
import { sunCycle } from "../test/fixtures";

describe("ExportCsvButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("downloads the results as a CSV file and revokes the object URL", async () => {
    // jsdom has no object URLs: stub them and the anchor click that starts the download.
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:csv");
    const revokeObjectURL = vi.fn<(url: string) => void>();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static createObjectURL = createObjectURL;
        static revokeObjectURL = revokeObjectURL;
      },
    );
    const clicked: HTMLAnchorElement[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this);
    });

    render(<ExportCsvButton data={sunCycle} />);
    await userEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob?.type).toBe("text/csv;charset=utf-8");
    expect(await blob?.text()).toBe(buildCsv(sunCycle));
    expect(clicked).toHaveLength(1);
    expect(clicked[0]?.href).toBe("blob:csv");
    expect(clicked[0]?.download).toBe("sunsapp-america-santiago-2026-06-21-2026-06-22.csv");
    expect(clicked[0]?.isConnected).toBe(false);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:csv");
  });
});
