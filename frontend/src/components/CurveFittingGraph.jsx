import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CurveFittingChart = ({ dataset, fittedCurve, isFitting }) => {
  
  const chartData = {
    labels: dataset.x, 
    datasets: [
      {
        label: "Data Points",
        data: dataset.x.map((x, i) => ({ x, y: dataset.y[i] })), 
        borderColor: "blue",
        backgroundColor: "blue",
        pointRadius: 2,
        pointHoverRadius: 7,
        showLine: false, 
      },
      {
        label: "Fitted Curve",
        data: fittedCurve.x.map((x, i) => ({ x, y: fittedCurve.y[i] })), 
        borderColor: isFitting ? "red" : "green",
        borderWidth: 2,
        fill: false,
        tension: 0, 
        showLine: true,
        pointRadius: 0, 
        pointHoverRadius: 0, 
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Curve Fitting",
        color: "white",
      },
    },
    scales: {
      x: {
        type: "linear", 
        
        min: Math.min(...dataset.x) , 
        max: Math.max(...dataset.x) + 20,
      },
      y: {
        
        min: Math.min(...dataset.y) - 1, 
        max: Math.max(...dataset.y) + 20,
      },
    },
    animation: {
      duration: 100, 
      easing: "easeInOutQuad",
    },
  };

  return (
    <div
      style={{
        width: "1000px",
        height: "500px", 
        backgroundColor: "black",
        padding: "20px",
        borderRadius: "10px",
        overflow: "hidden", 
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CurveFittingChart;
