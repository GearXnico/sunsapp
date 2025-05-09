import { useState } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import LoadingScreen from "./components/LoadingScreen";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app app-background">
      {loading && <LoadingScreen />}

      <div className={`app-container ${results.length > 0 ? "moved-up" : ""}`}>
        <h1 className="mt-4 mb-4">Sun Data Viewer</h1>
        <SearchForm setResults={setResults} setLoading={setLoading}/>
      </div>
      {results.length > 0 && (
        <div className={`app-container moved-down fade-in`}>
          <Results data={results}/>
        </div>
      )}
      <footer className="footer">
        <div className="container">
          <span className="footer-text">
            Powered by{' '}
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
