import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black border-b border-gray-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <img
              src="/icon/algoVisualized.webp"
              alt="AlgoVisualized Icon"
              className="h-12 w-12 object-contain rounded-lg border-2 transition-all border-purple-300 shadow-[0_0_15px_#CA00B6] animate-pulse-slow"
            />
            <Link 
              to="/" 
              className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow"
            >
              AlgoVisualized
            </Link>
          </div>

          <div className="hidden md:flex space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/") 
                  ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/sort-visualizer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/sort-visualizer") 
                  ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Sorting
            </Link>
            <Link
              to="/fit-visualizer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/fit-visualizer") 
                  ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Curve Fitting
            </Link>
            <Link
              to="/pathfind-visualizer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/pathfind-visualizer") 
                  ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Path Finding
            </Link>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-all"
            >
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-900/95 backdrop-blur-sm border-t border-gray-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`block px-4 py-3 rounded-lg text-base font-medium mx-2 transition-all ${
              isActive("/") 
                ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/sort-visualizer"
            className={`block px-4 py-3 rounded-lg text-base font-medium mx-2 transition-all ${
              isActive("/sort-visualizer") 
                ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sort Visualizer
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;