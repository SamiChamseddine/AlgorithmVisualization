import React, { useState, useEffect, useCallback, useRef } from "react";
import bubbleSort from "../utils/bubblesort";
import insertionSort from "../utils/insertionSort";
import selectionSort from "../utils/selectionSort";
import heapSort from "../utils/heapSort";
import mergeSort from "../utils/mergeSort";
import quickSort from "../utils/quickSort";
import shellSort from "../utils/shellSort";
import countingSort from "../utils/countingSort";

const SortVisualizer = () => {
  const [title, setTitle] = useState("Bubble Sort");
  const [array, setArray] = useState([]);
  const [auxArray, setAuxArray] = useState([]);
  const [arrayLength, setArrayLength] = useState(500);
  const [highlightedIndices, setHighlightedIndices] = useState([-1, -1]);
  const [isSorting, setIsSorting] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("Bubble Sort");
  const [isSorted, setIsSorted] = useState(false);
  const [swapCount, setSwapCount] = useState(0);
  const [sortTime, setSortTime] = useState(0);
  const [arrayAccesses, setArrayAccesses] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [speed, setSpeed] = useState("Fast");
  const abortControllerRef = useRef(null);

  const algorithmMap = {
    "Bubble Sort": bubbleSort,
    "Selection Sort": selectionSort,
    "Insertion Sort": insertionSort,
    "Merge Sort": mergeSort,
    "Quick Sort": quickSort,
    "Heap Sort": heapSort,
    "Shell Sort": shellSort,
    "Counting Sort": countingSort,
  };

  const algorithmDescriptions = {
    "Bubble Sort": `
  -> Time Complexity: O(n²) in worst/average case, O(n) when optimized on sorted array
  -> Space Complexity: O(1)
  -> Stable sorting algorithm
  -> Repeatedly compares adjacent elements and swaps them if disordered
  -> Largest elements "bubble up" to their correct position`,

    "Selection Sort": `
  -> Time Complexity: O(n²) in all cases
  -> Space Complexity: O(1)
  -> Not stable (may change order of equal elements)
  -> Maintains sorted and unsorted subarrays
  -> Always selects minimum element from unsorted portion`,

    "Insertion Sort": `
  -> Time Complexity: O(n²) in worst/average case, O(n) for nearly sorted data
  -> Space Complexity: O(1)
  -> Stable sorting algorithm
  -> Builds final sorted array one element at a time
  -> Efficient for small datasets or nearly sorted data`,

    "Merge Sort": `
  -> Time Complexity: O(n log n) in all cases
  -> Space Complexity: O(n)
  -> Stable sorting algorithm
  -> Divide-and-conquer approach
  -> Recursively splits array, sorts subarrays, then merges them`,

    "Quick Sort": `
  -> Time Complexity: O(n log n) average, O(n²) worst case
  -> Space Complexity: O(log n) due to recursion
  -> Not stable
  -> Divide-and-conquer with pivot selection
  -> Efficient for large datasets, cache-friendly`,

    "Heap Sort": `
  -> Time Complexity: O(n log n) in all cases
  -> Space Complexity: O(1)
  -> Not stable
  -> Converts array to max-heap structure
  -> Repeatedly extracts maximum element from heap`,

    "Shell Sort": `
  -> Time Complexity: O(n²) worst case, better for certain gap sequences
  -> Space Complexity: O(1)
  -> Not stable
  -> Generalization of insertion sort
  -> Sorts elements far apart first (using gap sequence)`,

    "Counting Sort": `
  -> Time Complexity: O(n + k) where k is range of input
  -> Space Complexity: O(n + k)
  -> Stable sorting algorithm
  -> Non-comparison based sort
  -> Effective when data range (k) is not significantly larger than number of items`,
  };
  useEffect(() => {
    generateRandomArray();
  }, [arrayLength]);

  const generateRandomArray = useCallback(() => {
    const randomArray = Array.from(
      { length: arrayLength },
      () => Math.floor(Math.random() * 150) + 1
    );
    setArray(randomArray);
    setAuxArray([...randomArray]);
    setHighlightedIndices([-1, -1]);
    setIsSorted(false);
    resetStatistics();
  }, [arrayLength]);

  const resetStatistics = () => {
    setSwapCount(0);
    setSortTime(0);
    setArrayAccesses(0);
    setComparisonCount(0);
  };

  const resetArray = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setArray([...auxArray]);
    resetStatistics();
    setHighlightedIndices([-1, -1]);
    setIsSorted(false);
  };

  const handleSizeChange = (e) => {
    setArrayLength(Number(e.target.value));
  };

  const handleAlgorithmChange = (e) => {
    setSelectedAlgorithm(e.target.value);
    setTitle(e.target.value);
  };

  const handleSpeedChange = (e) => {
    setSpeed(e.target.value);
  };

  const startSorting = useCallback(async () => {
    if (!algorithmMap[selectedAlgorithm]) return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsSorting(true);
    setIsSorted(false);
    const speedOptions = {
      Extreme: { delay: 1, updateSkip: 100 },
      Fast: { delay: 10, updateSkip: 10 },
      Intermediate: { delay: 10, updateSkip: 5 },
      Slow: { delay: 100, updateSkip: 1 },
    };

    const { delay, updateSkip } = speedOptions[speed];
    try {
      await algorithmMap[selectedAlgorithm](
        [...array],
        (newArray) => setArray(newArray),
        (indices) => setHighlightedIndices(indices),
        delay,
        updateSkip,
        setSwapCount,
        setSortTime,
        setArrayAccesses,
        setComparisonCount,
        signal
      );
      setIsSorted(() => (signal.aborted ? false : true));
    } catch (error) {
      console.error("Sorting error:", error);
    }
    setIsSorting(false);
  }, [array, selectedAlgorithm, speed]);

  return (
    <div className="flex flex-col items-center gap-1 p-1 bg-black min-h-screen text-gray-200">
      <div className="text-center">
        <h3 className="text-4xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow">
          {title}
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row w-full gap-1 max-w-7xl">
        <div className="flex-1 bg-black rounded-xl shadow-xl overflow-hidden p-1 border border-gray-800">
          <div
            className="flex justify-center items-end w-full h-64 bg-gray-900/50 rounded-lg"
            style={{ height: "350px" }}
          >
            {array.map((value, index) => (
              <div
                key={index}
                className={`flex-1 transition-all duration-300 ease-in-out ${
                  isSorted
                    ? "bg-gradient-to-t from-green-400 to-green-600 shadow-[0_0_15px_rgba(74,222,128,0.7)]"
                    : highlightedIndices.includes(index)
                    ? "bg-gradient-to-t  from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(244,63,94,0.7)] border border-rose-400"
                    : "bg-gradient-to-t  from-rose-500 to-rose-700"
                }`}
                style={{
                  height: `${value / 1.5}%`,
                  margin: arrayLength < 1000 ? "0 0.5px" : "0 0.1px",
                }}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 max-w-7xl">
            <div className="flex flex-col justify-center items-center gap-4 bg-black p-1 rounded-xl shadow-lg border border-gray-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={generateRandomArray}
                  className={`bg-blue-400 hover:bg-blue-300 text-white py-3 px-6 rounded-lg shadow-lg transition-all ${
                    isSorting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-[0_0_15px_#3b82f6]"
                  }`}
                  disabled={isSorting}
                >
                  Generate Array
                </button>
                <button
                  onClick={startSorting}
                  className={`bg-purple-600 hover:bg-purple-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all ${
                    isSorting
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-[0_0_15px_#CA00B6]"
                  }`}
                  disabled={isSorting}
                >
                  Start Sorting
                </button>
                <button
                  onClick={resetArray}
                  className="bg-rose-600 hover:bg-rose-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all hover:shadow-[0_0_15px_#f43f5e]"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black p-1 rounded-xl shadow-lg border border-gray-800">
              <div className="flex flex-col gap-1">
                <label className="text-gray-300 text-sm">Speed:</label>
                <select
                  className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                  value={speed}
                  onChange={handleSpeedChange}
                  disabled={isSorting}
                >
                  <option value="Fast">Fast</option>
                  <option value="Intermediate">Medium</option>
                  <option value="Slow">Slow</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-300 text-sm">Size:</label>
                <select
                  className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                  onChange={handleSizeChange}
                  value={arrayLength}
                  disabled={isSorting}
                >
                  <option value={100}>100 Elements</option>
                  <option value={500}>500 Elements</option>
                  <option value={1000}>1000 Elements</option>
                  <option value={2000}>2000 Elements</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-300 text-sm">Algorithm:</label>
                <select
                  className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-purple-500"
                  value={selectedAlgorithm}
                  onChange={handleAlgorithmChange}
                  disabled={isSorting}
                >
                  {Object.keys(algorithmMap).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-black border border-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-80">
          <h4 className="text-xl font-bold text-center text-blue-400 drop-shadow-[0_0_8px_#80BCFF] animate-pulse-slow">
            Sorting Stats
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Array Accesses:</span>
              <span className="text-blue-400 font-medium">{arrayAccesses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Element Swaps:</span>
              <span className="text-green-400 font-medium">{swapCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Comparisons:</span>
              <span className="text-purple-400 font-medium">
                {comparisonCount}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-purple-400">
                {selectedAlgorithm}
              </h3>
            </div>
            <p className="text-gray-300 text-sm">
              {algorithmDescriptions[selectedAlgorithm]
                .trim()
                .split("\n")
                .filter((line) => line)
                .map((line, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-teal-400 mr-2">▹</span>
                    <span>{line.replace("->", "").trim()}</span>
                  </li>
                ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortVisualizer;
