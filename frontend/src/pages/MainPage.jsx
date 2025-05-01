import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const images = [
  {
    type: "sort",
    link: "/icon/algo.png",
    description:
      "Visualize how different sorting algorithms work in real-time. " +
      "Understand the inner workings of algorithms like Bubble Sort, Merge Sort, " +
      "Quick Sort, and more with interactive animations.",
    title: "Sort Visualizer",
  },
  {
    type: "fit",
    link: "/icon/algo.png",
    description:
      "Visualize fitting how curve fitting works. " +
      "Examine polynomial fitting with different degrees for curve approximation.",
    title: "Fit Visualizer",
  },
  {
    type: "find",
    link: "/icon/algo.png",
    description:
      "Visualize how pathfinding algorithms explore graphs. " +
      "Discover techniques like BFS, Dijkstra's, " +
      "and Nearest/Farthest Insertion to find paths or and solve TPS.",
    title: "Path Finding",
  },
];

const MainPage = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  const getCurrentPath = () => {
    const type = images[currentImage].type;
    switch (type) {
      case "sort":
        return "/sort-visualizer";
      case "fit":
        return "/fit-visualizer";
      case "find":
        return "/pathfind-visualizer";
      default:
        return "/";
    }
  };
  return (
    <div className="flex flex-col items-center gap-1 p-1 bg-black h-screen text-gray-200">
            <div className=" top-20 left-0 right-0 mx-auto w-full max-w-3xl px-4 z-20">
        <blockquote className="text-center italic text-gray-300 text-sm md:text-base p-1 rounded-xl">
          "The purpose of computing is insight, not numbers. But to gain
          insight, we need visualization."
          <footer className="mt-1 text-purple-400/80 not-italic text-xs md:text-sm">
            — Richard Hamming
          </footer>
        </blockquote>
      </div>
      <div className="relative flex flex-col items-center justify-center border border-gray-800 rounded-xl h-screen w-full max-w-7xl bg-gradient-to-r from-gray-900/50 to-gray-900/70 overflow-hidden shadow-xl">
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentImage === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.link}
                alt={`Background ${index}`}
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black bg-opacity-70" />
            </div>
          ))}
        </div>

        <div className="text-center z-10">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
                currentImage === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow">
                {image.title}
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mb-8 px-4 backdrop-blur-sm bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                {image.description}
              </p>
              <Link
                to={getCurrentPath()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 px-6 rounded-lg shadow-lg transition-all hover:shadow-[0_0_15px_#CA00B6]"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>

      <footer className="w-full bg-gray-900/50 border-t border-gray-800 mt-auto py-4 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} AlgoVisualized. All rights
            reserved.
          </p>
          <p className="text-gray-400 mt-2">By Sami Chamseddine</p>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
