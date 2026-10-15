import ResultsChart from "./ResultsChart";
import type { SunCycleResponse } from "../api/types";
import { formatUtcOffset } from "../lib/time";

interface ResultsProps {
  data: SunCycleResponse;
}

const EMPTY = "—";

function Results({ data }: ResultsProps) {
  const { location, timezone, days } = data;
  // A DST change inside the range gives days with different offsets: show it per row.
  const offsets = new Set(days.map((day) => day.utc_offset));
  const offsetPerRow = offsets.size > 1;
  const zoneLabel = offsetPerRow
    ? `Times in ${timezone}`
    : `Times in ${timezone} (${formatUtcOffset(days[0]?.utc_offset ?? 0)})`;

  return (
    <div className="table-container">
      <h1>{location}</h1>
      <p>{zoneLabel}</p>
      <div className="chart-container mb-4">
        <ResultsChart data={data} />
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-color">
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
            {days.map((day) => (
              <tr key={day.date}>
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
    </div>
  );
}

export default Results;
