import React from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const ResultsChart = ({ data }) => {
  const labels = data.map(entry => entry.start_date);
  const sunriseData = data.map(entry => parseTime(entry.sunrise));
  const sunsetData = data.map(entry => parseTime(entry.sunset));
  const goldenData = data.map(entry => parseTime(entry.golden_hour));  

  const chartData = {
    labels,
    datasets: [
      {
        label: "Sunrise",
        data: sunriseData,
        borderColor: "#FFD88C",
        backgroundColor: "#FFD88C",
        tension: 0.3,
      },
      {
        label: "Sunset",
        data: sunsetData,
        borderColor: "#5C84B9",
        backgroundColor: "#5C84B9",
        tension: 0.3,
      },
      {
        label: "Golden Hour",
        data: goldenData,
        borderColor: "#F99E66",
        backgroundColor: "#F99E66",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" ,
        color: "#FFD88C",
        labels: { 
            font: { weight: "bold" }
        },
        title: { 
            color: "#FFD88C",
            font: { weight: "bold" }
        }
        },
      tooltip: {
        callbacks: {
          label: function (context) {
            return formatTime(context.raw);
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => formatTime(val),
          color: "#FFD88C",
        },
        title: {
          display: true,
          text: "Time of Day",
          color: "#FFD88C",
          font: { weight: "bold" },
        },
      },
      x: {
        ticks: {
          color: "#FFD88C",
        },
        title: {
          display: true,
          text: "Date",
          color: "#FFD88C",
          font: { weight: "bold" },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

// Convert "HH:MM" to minutes since midnight
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight back to "HH:MM"
const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default ResultsChart;
