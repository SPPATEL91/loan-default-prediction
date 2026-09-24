/**
 * Navbar.jsx
 * ==========
 * Top navigation bar component for the Loan Default Prediction application.
 *
 * Concepts for learning:
 * - Uses `NavLink` from `react-router-dom` which automatically adds an 'active' class
 *   when the current browser URL matches the link's `to` prop.
 * - Displays a responsive brand header and quick links.
 */

import React from 'react';
import { NavLink, Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg custom-navbar fixed-top">
      <div className="container">
        {/* Brand Logo & Title */}
        <Link className="navbar-brand" to="/">
          <span className="brand-icon">💳</span>
          <span>LoanGuard AI</span>
          <span className="badge-ai ms-1">v1.0</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                end
              >
                🏠 Home & Overview
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                to="/predict" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                📊 Predict Default Risk
              </NavLink>
            </li>
            <li className="nav-item ms-lg-2">
              <a 
                href="http://localhost:8000/docs" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm btn-outline-primary"
                title="Open FastAPI Swagger Interactive Docs"
              >
                ⚡ FastAPI Docs
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
