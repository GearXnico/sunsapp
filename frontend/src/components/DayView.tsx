import SkyBand from "./SkyBand";
import StageList from "./StageList";
import type { SunCycleResponse } from "../api/types";
import { dayLength, dayStages, formatDuration, formatLengthChange } from "../lib/dayView";
import { formatUtcOffset } from "../lib/time";
import "./DayView.css";

interface DayViewProps {
  data: SunCycleResponse;
  selected: number;
  onSelect: (index: number) => void;
}

// One day of the range: header, 24-hour sky band, stages and Prev/Next between days.
function DayView({ data, selected, onSelect }: DayViewProps) {
  const { location, matched_place: matchedPlace, timezone, days } = data;
  const day = days[selected];
  if (!day) return null;

  const length = dayLength(day);
  const previous = days[selected - 1];
  const previousLength = previous ? dayLength(previous) : null;
  const change = length !== null && previousLength !== null ? formatLengthChange(length, previousLength) : null;

  return (
    <section className="day-view" aria-label="Day view">
      <header className="day-header">
        <div>
          <h1>{location}</h1>
          {matchedPlace && <div className="day-muted">Showing {matchedPlace}</div>}
          <div className="day-muted">
            {timezone} · {formatUtcOffset(day.utc_offset)} · {day.date}
          </div>
        </div>
        <div className="day-length">
          Day length
          <b>{length === null ? "—" : formatDuration(length)}</b>
          {change && <span className="day-change">{change} vs. previous day</span>}
        </div>
      </header>

      <div className="day-card">
        <div className="day-row">
          <div className="day-nav">
            <button type="button" onClick={() => onSelect(selected - 1)} disabled={selected === 0}>
              ‹ Prev
            </button>
            <span className="day-current" aria-live="polite">
              {day.date}
            </span>
            <button type="button" onClick={() => onSelect(selected + 1)} disabled={selected === days.length - 1}>
              Next ›
            </button>
          </div>
          <span className="day-muted">Times in the place&apos;s local time</span>
        </div>
        <div className="day-scroll">
          <SkyBand day={day} />
        </div>
      </div>

      <h2>Stages</h2>
      <StageList stages={dayStages(day)} />
    </section>
  );
}

export default DayView;
