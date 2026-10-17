import { useState } from "react";
import DayView from "./DayView";
import ResultsChart from "./ResultsChart";
import ExportCsvButton from "./ExportCsvButton";
import type { SunCycleResponse } from "../api/types";
import { formatUtcOffset } from "../lib/time";

interface ResultsProps {
  data: SunCycleResponse;
}

const EMPTY = "—";
const CHART_ID = "results-variation";

function Results({ data }: ResultsProps) {
  const { location, matched_place: matchedPlace, timezone, days } = data;
  // The selected day goes back to the first one when a new search brings new data.
  const [selection, setSelection] = useState({ data, index: 0 });
  const selected = selection.data === data ? selection.index : 0;
  const [showChart, setShowChart] = useState(false);
  // A DST change inside the range gives days with different offsets: show it per row.
  const offsets = new Set(days.map((day) => day.utc_offset));
  const offsetPerRow = offsets.size > 1;
  const zoneLabel = offsetPerRow
    ? `Times in ${timezone}`
    : `Times in ${timezone} (${formatUtcOffset(days[0]?.utc_offset ?? 0)})`;

  return (
    <>
      <header>
        <h1 className="place">{location}</h1>
        {matchedPlace && <div className="meta">Showing {matchedPlace}</div>}
        <div className="meta">{zoneLabel}</div>
      </header>

      <DayView data={data} selected={selected} onSelect={(index) => setSelection({ data, index })} />

      <section className="all-days" aria-labelledby="all-days">
        <div className="row">
          <h2 id="all-days">All days</h2>
          <div className="actions">
            <button
              type="button"
              aria-expanded={showChart}
              aria-controls={CHART_ID}
              onClick={() => setShowChart((shown) => !shown)}
            >
              {showChart ? "Hide variation" : "See variation"}
            </button>
            <ExportCsvButton data={data} />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sunrise</th>
                <th>Sunset</th>
                <th>Golden hour (evening)</th>
                {offsetPerRow && <th>UTC offset</th>}
              </tr>
            </thead>
            <tbody>
              {days.map((day, index) => (
                <tr key={day.date} aria-current={index === selected ? "true" : undefined}>
                  <td>{day.date}</td>
                  <td>{day.sunrise ?? EMPTY}</td>
                  <td>{day.sunset ?? EMPTY}</td>
                  <td>{day.golden_hour ?? EMPTY}</td>
                  {offsetPerRow && <td>{formatUtcOffset(day.utc_offset)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div id={CHART_ID} className="chart-card" hidden={!showChart}>
          {showChart && <ResultsChart data={data} />}
        </div>
      </section>
    </>
  );
}

export default Results;
