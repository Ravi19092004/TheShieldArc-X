
"use client";

import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const lineChartData = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      label: "Safe Scans",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
    {
      label: "Phishing Scans",
      data: [28, 48, 40, 19, 86, 27, 90],
      fill: false,
      borderColor: "rgb(255, 99, 132)",
      tension: 0.1,
    },
  ],
};

const pieChartData = {
  labels: ["Safe", "Phishing"],
  datasets: [
    {
      label: "# of Scans",
      data: [12, 19],
      backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
      borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
      borderWidth: 1,
    },
  ],
};

export const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Scan Statistics (Line Chart)</h2>
        <Line data={lineChartData} />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Scan Statistics (Pie Chart)</h2>
        <Pie data={pieChartData} />
      </div>
    </div>
  );
};
