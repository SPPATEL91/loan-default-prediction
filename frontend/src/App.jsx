/**
 * App.jsx
 * =======
 * Main Application Component.
 *
 * Concepts for learning:
 * - `BrowserRouter` (aliased as Router) listens to the browser's URL and manages history.
 * - `Routes` and `Route` define mapping between URL paths (like "/" or "/predict")
 *   and the React page components that should render.
 * - `Navbar` is placed outside `<Routes>` so that it appears persistently across all pages.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/Predict';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      {/* Top persistent navigation bar */}
      <Navbar />

      {/* Main page content area */}
      <main className="main-wrapper">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-muted border-top bg-white mt-auto">
        <div className="container">
          <p className="small mb-0">
            Loan Default Prediction Platform &bull; Powered by Decision Tree Classifier &amp; FastAPI
          </p>
        </div>
      </footer>
    </Router>
  );
}

export default App;
