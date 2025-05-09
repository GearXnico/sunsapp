import { useState } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [results, setResults] = useState([]);

  return (
    <div className="app app-background">
      <div className={`app-container ${results.length > 0 ? "moved-up" : ""}`}>
        <h1 className="mt-4 mb-4">Sun Data Viewer</h1>
        <SearchForm setResults={setResults} />
      </div>
      {results.length > 0 && (
        <div className={`app-container moved-down fade-in`}>
          <Results data={results}/>
        </div>
      )}
    </div>
  );
}

export default App;
