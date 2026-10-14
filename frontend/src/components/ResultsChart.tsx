import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { SunCycleResponse } from "../api/types";
import { buildChartData } from "../lib/chartData";
import { formatTime, formatUtcOffset } from "../lib/time";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ResultsChartProps {
  data: SunCycleResponse;
}

const MINUTES_PER_DAY = 24 * 60;
const TICK_STEP = 3 * 60;

const ResultsChart = ({ data }: ResultsChartProps) => {
  const { timezone, days } = data;

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
          label: (context) => {
            const day = days[context.dataIndex];
            const offset = day ? ` (${formatUtcOffset(day.utc_offset)})` : "";
            const time = formatTime(context.parsed.y ?? 0);
            return `${context.dataset.label}: ${time} ${timezone}${offset}`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: MINUTES_PER_DAY,
        ticks: {
          stepSize: TICK_STEP,
          callback: (val) => formatTime(Number(val)),
          color: "#FFD88C",
        },
        title: {
          display: true,
          text: `Local time (${timezone})`,
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

  return <Line data={buildChartData(days)} options={options} />;
};

export default ResultsChart;
