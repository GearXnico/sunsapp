import ResultsChart from "./ResultsChart";
import type { SunCycleDay } from "../api/types";

interface ResultsProps {
  data: SunCycleDay[];
}

function Results({ data }: ResultsProps) {
  return (
    <div className="table-container">
      <h1>{data[0]?.location}</h1>
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
              <th>Golden Hour</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day, index) => (
              <tr key={index}>
                <td>{day.start_date}</td>
                <td>{day.sunrise}</td>
                <td>{day.sunset}</td>
                <td>{day.golden_hour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Results;
