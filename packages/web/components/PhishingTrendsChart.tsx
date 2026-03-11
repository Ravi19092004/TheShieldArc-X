import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PhishingTrendsChartProps {
  data?: {
    labels: string[];
    phishing: number[];
    safe: number[];
  };
}

const PhishingTrendsChart: React.FC<PhishingTrendsChartProps> = ({ data }) => {
  // Default data if none provided
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    phishing: [65, 78, 52, 74, 33, 42, 28],
    safe: [28, 48, 40, 19, 86, 27, 90],
  };

  const chartData = data || defaultData;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  };

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Phishing Sites',
        data: chartData.phishing,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Safe Sites',
        data: chartData.safe,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Phishing Trends</h2>
      <div className="h-80">
        <Line options={chartOptions} data={chartDataConfig} />
      </div>
    </div>
  );
};

export default PhishingTrendsChart;
