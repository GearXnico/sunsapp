import { useState } from "react";
import axios from "axios";

const SearchForm = ({ setResults }) => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || !startDate || !endDate) {
      alert("Please fill in all fields.");
      return;
    }
    if (!location.trim()) {
        alert("Please enter a location.");
        return;
    }
    if (startDate > endDate) {
      alert("Start date must be before end date.");
      return;
    }
    if (startDate === "" || endDate === "") {
      alert("Please select a date range.");
      return;
    }
    if (startDate.length !== 10 || endDate.length !== 10) {
      alert("Please enter a valid date.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3000/api/sun_cycle", {
        params: { location, start_date: startDate, end_date: endDate }
      });
      setResults(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);

    if (error.response) {
      // Error response from server
      const { status, data } = error.response;
      if (status === 400) {
        alert(`Bad Request: ${data.error}`);
      } else if (status === 404) {
        alert(`Not Found: ${data.error}`);
      } else if (status === 500) {
        alert(`Server Error: ${data.error}`);
      } else {
        alert(`Unexpected error: ${data.error || 'Something went wrong.'}`);
      }
    } else if (error.request) {
      // No response received
      alert("No response from server. Check your connection.");
    } else {
      // Something else went wrong
      alert("Request error: " + error.message);
    }
    setResults([]); // clear previous results if there's an error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="mb-2">
        <input type="text" className="form-control mb-2" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <label htmlFor="startDate">Start Date</label>
          <input type="date" className="form-control mt-2 mb-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div className="col-md-6 mb-2">
          <label htmlFor="endDate">End Date</label>
          <input type="date" className="form-control mt-2 mb-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
      </div>
        <button className="btn btn-primary w-100 mt-3">Search</button>
    </form>
  );
};

export default SearchForm;
