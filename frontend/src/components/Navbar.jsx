import React from 'react';
import { NavLink, Link } from 'react-router-dom';

/**
 * Navbar.jsx
 * ==========
 * Institutional header component with high-tech brand identity,
 * pulse model online indicator, and responsive navigation links.
 */
function Navbar() {
  const docsUrl = `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:8000" : "")}/docs`;

  return (
    <header className="navbar-institutional">
      <div className="nav-container">
        {/* Brand Logo & Title */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <span className="brand-title">LOANGUARD</span>
            <span className="brand-badge">AI PLATFORM</span>
          </div>
        </Link>

        {/* Live Model Status Indicator */}
        <div className="nav-status-indicator d-none d-md-flex">
          <span className="status-dot-active" />
          <span>MODEL ONLINE</span>
          <span className="text-muted ms-1">| v1.0</span>
        </div>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink 
                to="/predict" 
                className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>Risk Workspace</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                end
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                <span>Architecture</span>
              </NavLink>
            </li>
            <li>
              <a 
                href={docsUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="nav-link-custom text-gradient-cyan"
                title="Interactive Swagger API Documentation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>API Specs</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
