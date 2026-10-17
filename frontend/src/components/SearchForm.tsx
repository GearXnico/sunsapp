import { useState, type FormEvent } from "react";
import { fetchSunCycle } from "../api/client";
import ErrorMessage from "./ErrorMessage";
import LoadingScreen from "./LoadingScreen";
import type { SunCycleResponse } from "../api/types";
import { searchError, type SearchError } from "../lib/errors";

interface SearchFormProps {
  setResults: (results: SunCycleResponse | null) => void;
  // One row on top of the results instead of the centered start card.
  compact?: boolean;
}

const ERROR_ID = "search-error";

function SearchForm({ setResults, compact = false }: SearchFormProps) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<SearchError | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): SearchError | null => {
    if (!location) return { title: "Please fill in all fields.", field: "location" };
    if (!startDate || !endDate) return { title: "Please fill in all fields.", field: "dates" };
    if (!location.trim()) return { title: "Please enter a location.", field: "location" };
    if (startDate > endDate) return { title: "The start date must be before the end date.", field: "dates" };
    if (startDate.length !== 10 || endDate.length !== 10) {
      return { title: "One of the dates is not valid.", field: "dates" };
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const invalid = validate();
    setError(invalid);
    if (invalid) return;

    setLoading(true);
    try {
      setResults(await fetchSunCycle({ location, start_date: startDate, end_date: endDate }));
    } catch (err) {
      setError(searchError(err));
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const invalid = (field: SearchError["field"]) =>
    error?.field === field ? { "aria-invalid": true, "aria-describedby": ERROR_ID } : {};
  const alert = error && <ErrorMessage id={ERROR_ID} error={error} />;

  return (
    <>
      <form className={compact ? "search inline" : "search"} aria-label="Search" onSubmit={handleSubmit} noValidate>
        <label className="loc">
          Location
          <input
            type="text"
            placeholder="City, region or country"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            {...invalid("location")}
          />
        </label>
        <div className="dates">
          <label>
            From
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              {...invalid("dates")}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              {...invalid("dates")}
            />
          </label>
        </div>
        {!compact && <span className="hint">Up to 366 days.</span>}
        {!compact && alert}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {compact && alert}
      {loading && <LoadingScreen place={location.trim()} />}
    </>
  );
}

export default SearchForm;
