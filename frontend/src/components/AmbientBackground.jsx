import React, { useEffect, useRef } from 'react';

/**
 * AmbientBackground.jsx
 * =====================
 * Institutional dark-mode background with ambient cursor glow,
 * radial gradients, and subtle structural grid mesh.
 */
function AmbientBackground() {
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        // Move the subtle ambient glow towards cursor with 0.1s lag for smooth fluidity
        glowRef.current.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Grid overlay */}
      <div className="ambient-grid" />
      
      {/* Cursor-responsive ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 92, 255, 0.08) 0%, rgba(34, 211, 238, 0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'transform 0.25s cubic-bezier(0.1, 1, 0.1, 1)',
          willChange: 'transform'
        }}
      />
    </>
  );
}

export default AmbientBackground;
