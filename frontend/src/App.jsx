import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AmbientBackground from './components/AmbientBackground';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PredictPage from './pages/Predict';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-viewport">
        {/* Dark Cinematic Ambient Glow Background */}
        <AmbientBackground />

        <div className="app-container">
          {/* Institutional Top Header Navbar */}
          <Navbar />

          {/* Main Routing Area */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Minimalist Institutional Footer */}
          <footer className="footer-institutional">
            <div className="container">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <span className="fw-bold text-slate-200">LOANGUARD AI</span> &bull; Credit Risk Intelligence Platform
                </div>
                <div className="font-mono text-muted" style={{ fontSize: "0.75rem" }}>
                  DECISION TREE CLASSIFIER • FASTAPI BACKEND &bull; ALL SYSTEMS NORMAL
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
