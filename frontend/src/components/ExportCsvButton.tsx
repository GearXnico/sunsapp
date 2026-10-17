import type { SunCycleResponse } from "../api/types";
import { buildCsv, csvFileName } from "../lib/csv";

interface ExportCsvButtonProps {
  data: SunCycleResponse;
}

// Download the results as a CSV file built in the browser (ADR 0015).
function ExportCsvButton({ data }: ExportCsvButtonProps) {
  const download = () => {
    const blob = new Blob([buildCsv(data)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = csvFileName(data);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button type="button" onClick={download}>
      Export CSV
    </button>
  );
}

export default ExportCsvButton;
