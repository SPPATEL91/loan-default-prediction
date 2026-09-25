import React, { useEffect, useRef } from 'react';

/**
 * AmbientBackground.jsx
 * =====================
 * Premium Light Theme background layer with ambient cursor glow,
 * subtle indigo/cyan radial gradients, and clean grid mesh.
 */
function AmbientBackground() {
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Light grid overlay */}
      <div className="ambient-grid" />
      
      {/* Soft Light Cursor-responsive ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, rgba(2, 132, 199, 0.03) 40%, transparent 70%)',
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
