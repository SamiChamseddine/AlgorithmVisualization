import React, { useState, useEffect, useRef } from "react";
import Plot from "react-plotly.js";

const CurveFitVisualization = () => {
  const [dataset, setDataset] = useState({ x: [], y: [] });
  const datasetRef = useRef(dataset);
  const [statistics, setStatistics] = useState({ mse: 0, r_squared: 0 });
  const [fittedCurve, setFittedCurve] = useState({ x: [], y: [] });
  const [progress, setProgress] = useState(0);
  const [degree, setDegree] = useState(2);
  const [delay, setDelay] = useState(0.1);
  const [isFitting, setIsFitting] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState("sin");

  useEffect(() => {
    const ws = new WebSocket(
      "wss://algorithmvisualizationbackend.onrender.com/ws/fit/"
    );
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      ws.send(
        JSON.stringify({
          action: "generate_dataset",
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.dataset) {
        const newDataset = {
          x: [...data.dataset.x],
          y: [...data.dataset.y],
        };
        setDataset(newDataset);
        datasetRef.current = newDataset;
        setFittedCurve({ x: [], y: [] });
        setProgress(0);
      }

      if (data.progress !== undefined) {
        setProgress(data.progress);

        if (data.coefficients) {
          const fittedY = datasetRef.current.x.map((xi) =>
            data.coefficients.reduce(
              (sum, coeff, i) =>
                sum + coeff * xi ** (data.coefficients.length - i - 1),
              0
            )
          );
          setFittedCurve({
            x: datasetRef.current.x,
            y: fittedY,
          });
          setStatistics({ mse: data.mse, r_squared: data.r_squared });
        }
      }

      if (data.isFitted) {
        setIsFitting(false);
      }

      if (data.error) {
        console.error("Error during fitting:", data.error);
        setIsFitting(false);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleGenerateDataset = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "generate_dataset",
        })
      );
    }
  };

  const handleStartFitting = () => {
    if (dataset.x.length === 0) return;
    if (degree>20){
      alert("Polynomial Degree should be less than or equal to 20");
      return;
    }
    setIsFitting(true);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "start_fitting",
          method: "polynomial",
          degree,
          delay,
        })
      );
    }
  };
  const FUNCTION_TYPES = [
    { label: "Sinusoidal", value: "sin" },
    { label: "Linear", value: "linear" },
    { label: "Quadratic", value: "quadratic" },
    { label: "Exponential", value: "exponential" },
    { label: "Logarithmic", value: "logarithmic" },
  ];
  const handleFunctionChange = (e) => {
    setSelectedFunction(e.target.value);
    socket.send(
      JSON.stringify({
        action: "generate_dataset",
        function_type: e.target.value,
      })
    );
  };
  return (
    <div className="flex flex-col items-center gap-1 p-1 bg-black min-h-screen text-gray-200">
      {/* Title Section */}
      <div className="text-center">
        <h3 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow">
          Curve Fitting Visualizer
        </h3>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row w-full gap-1 max-w-7xl">
        {/* Plot Container */}
        <div className="flex-1 bg-black rounded-xl shadow-xl overflow-hidden p-1 border border-gray-800">
          <Plot
            data={[
              {
                x: dataset.x,
                y: dataset.y,
                type: "scatter",
                mode: "markers",
                marker: {
                  color: isFitting ? "#FF007F" : "#FF007F",
                  size: 8,
                  line: {
                    width: 1,
                    color: isFitting ? "#93c5fd" : "#f9a8d4",
                  },
                },
                name: "Dataset",
              },
              {
                x: fittedCurve.x,
                y: fittedCurve.y,
                type: "scatter",
                mode: "lines",
                line: {
                  color: isFitting ? "#f43f5e" : "#10b981",
                  width: 3,
                  shape: "spline",
                },
                name: "Fitted Curve",
              },
            ]}
            layout={{
              xaxis: {
                range: [Math.min(...dataset.x), Math.max(...dataset.x)],
                color: "#9ca3af",
                gridcolor: "#1f2937",
                linecolor: "#374151",
              },
              yaxis: {
                range: [Math.min(...dataset.y), Math.max(...dataset.y)],
                color: "#9ca3af",
                gridcolor: "#1f2937",
                linecolor: "#374151",
              },
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#e5e7eb" },
              legend: {
                font: {
                  color: "#e5e7eb",
                },
                bgcolor: "rgba(0,0,0,0)",
              },
              margin: {
                t: 40,
                b: 40,
                l: 40,
                r: 40,
              },
            }}
            config={{
              displayModeBar: false,
              staticPlot: true,
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "400px" }}
          />
        </div>

        {/* Stats Section */}
        <div className="flex flex-col gap-4 bg-black border border-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-80">
          <h4 className="text-xl font-bold text-center text-blue-400 drop-shadow-[0_0_8px_#80BCFF] animate-pulse-slow">
            Fitting Stats
          </h4>
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-300">Progress:</span>
                <span className="text-green-400 font-medium">{progress}%</span>
              </div>
              <div className="bg-gray-800 rounded-full h-2.5 w-full">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Mean Squared Error:</span>
              <span className="text-yellow-400 font-medium">
                {statistics.mse.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">R² Score:</span>
              <span className="text-purple-400 font-medium">
                {statistics.r_squared.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-7xl">
        {/* Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black p-4 rounded-xl shadow-lg border border-gray-800">
          {/* Function Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm">Function Type:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
              value={selectedFunction}
              onChange={handleFunctionChange}
              disabled={isFitting}
            >
              {FUNCTION_TYPES.map((fn) => (
                <option key={fn.value} value={fn.value}>
                  {fn.label}
                </option>
              ))}
            </select>
          </div>

          {/* Polynomial Degree */}
          <div className="flex flex-col gap-2 w-full max-w-xs mx-auto sm:max-w-sm">
            <label className="text-gray-300 text-sm sm:text-base">
              Polynomial Degree:
            </label>
            <input
              type="number"
              value={degree}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setDegree(value);
              }}
              className="bg-gray-800 text-white px-4 py-3 text-base rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
              disabled={isFitting}
            />
          </div>

          {/* Delay Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm">Animation Speed:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
              value={delay}
              onChange={(e) => setDelay(parseFloat(e.target.value))}
              disabled={isFitting}
            >
              <option value="0.01">Fast</option>
              <option value="0.1">Medium</option>
              <option value="0.5">Slow</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 bg-black p-4 rounded-xl shadow-lg border border-gray-800">
          <button
            onClick={handleGenerateDataset}
            className={`bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all ${
              isFitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-[0_0_15px_#3b82f6]"
            }`}
            disabled={isFitting}
          >
            Generate Dataset
          </button>
          <button
            onClick={handleStartFitting}
            className={`bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all ${
              isFitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-[0_0_15px_#CA00B6]"
            }`}
            disabled={isFitting}
          >
            Start Fitting
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurveFitVisualization;
