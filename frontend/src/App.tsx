import { useState } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import type { SunCycleResponse } from "./api/types";
import "./App.css";

function App() {
  const [results, setResults] = useState<SunCycleResponse | null>(null);
  const hasResults = results !== null && results.days.length > 0;

  return (
    <div className="app">
      <main className={hasResults ? "shell" : "shell narrow"}>
        {!hasResults && (
          <div className="hero">
            <div className="brand">
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                <path className="brand-horizon" d="M3 19h22" />
                <path className="brand-sun" d="M7 19a7 7 0 0 1 14 0" />
              </svg>
              <b>sunsapp</b>
            </div>
            <h1>When does the sun rise and set?</h1>
            <p>Sunrise, sunset, golden hour and twilight for any place, in its local time.</p>
          </div>
        )}
        <SearchForm setResults={setResults} compact={hasResults} />
        {hasResults && <Results data={results} />}
      </main>
      <footer className="footer">
        Sun times by <a href="https://sunrisesunset.io/">SunriseSunset.io</a> · Places by{" "}
        <a href="https://nominatim.org/">Nominatim</a> (© OpenStreetMap contributors)
      </footer>
    </div>
  );
}

export default App;
