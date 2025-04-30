import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { path: "/", name: "Home" },
    { path: "/sort-visualizer", name: "Sorting" },
    { path: "/fit-visualizer", name: "Curve Fitting" },
    { path: "/pathfind-visualizer", name: "Path Finding" },
  ];

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

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path) 
                    ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 transition-all duration-300 ease-in-out`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-3 rounded-lg text-base font-medium mx-2 transition-all ${
                isActive(link.path) 
                  ? "bg-purple-600 text-white shadow-[0_0_10px_#CA00B6]" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={toggleMobileMenu}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
