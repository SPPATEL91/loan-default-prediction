import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="workspace-wrapper text-center py-5 my-5">
      <div className="glass-panel p-5 max-w-600 mx-auto">
        <div className="font-mono text-gradient-purple fw-bold mb-2" style={{ fontSize: "4rem" }}>404</div>
        <h2 className="fw-bold mb-3">Resource Not Found</h2>
        <p className="text-muted mb-4">
          The requested risk intelligence workspace path does not exist or has been relocated.
        </p>
        <Link to="/predict" className="btn-analyze-primary">
          <span>RETURN TO WORKSPACE →</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;