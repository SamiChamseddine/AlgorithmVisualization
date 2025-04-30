import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SortVisualizer from "./pages/SortVisualizer";
import CurveFitVisualization from "./pages/CurveFitVisualization";
import MainPage from "./pages/MainPage";
import PathfindVisualizer from "./pages/PathFindVisualizer";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainPage />} />
          <Route path="sort-visualizer" element={<SortVisualizer />} />
          <Route path="fit-visualizer" element={<CurveFitVisualization />} />
          <Route path="pathfind-visualizer" element={<PathfindVisualizer />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
