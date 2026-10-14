import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SunCycleDay } from "../api/types";
import { formatTime, parseTime } from "../lib/time";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ResultsChartProps {
  data: SunCycleDay[];
}

const ResultsChart = ({ data }: ResultsChartProps) => {
  const labels = data.map((entry) => entry.start_date);
  const sunriseData = data.map((entry) => parseTime(entry.sunrise));
  const sunsetData = data.map((entry) => parseTime(entry.sunset));
  const goldenData = data.map((entry) => parseTime(entry.golden_hour));

  const chartData: ChartData<"line", (number | null)[], string> = {
    labels,
    datasets: [
      {
        label: "Sunrise",
        data: sunriseData,
        borderColor: "#FFD88C",
        backgroundColor: "#FFD88C",
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Sunset",
        data: sunsetData,
        borderColor: "#5C84B9",
        backgroundColor: "#5C84B9",
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: "Golden Hour",
        data: goldenData,
        borderColor: "#F99E66",
        backgroundColor: "#F99E66",
        tension: 0.3,
        spanGaps: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { weight: "bold" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => formatTime(context.raw as number),
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => formatTime(Number(val)),
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

export default ResultsChart;
