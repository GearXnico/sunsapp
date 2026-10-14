import { useState } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import LoadingScreen from "./components/LoadingScreen";
import type { SunCycleResponse } from "./api/types";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [results, setResults] = useState<SunCycleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const hasResults = results !== null && results.days.length > 0;

  return (
    <div className="app app-background">
      {loading && <LoadingScreen />}

      <div className={`app-container ${hasResults ? "moved-up" : ""}`}>
        <h1 className="mt-4 mb-4">Sun Data Viewer</h1>
        <SearchForm setResults={setResults} setLoading={setLoading} />
      </div>
      {hasResults && (
        <div className={`app-container moved-down fade-in`}>
          <Results data={results} />
        </div>
      )}
      <footer className="footer">
        <div className="container">
          <span className="footer-text">
            Powered by{" "}
            <a className="footer-url" href="https://sunrisesunset.io/api/">
              SunriseSunset.io
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
