import React, { useEffect, useRef } from 'react';
import { createEcosystemWorld } from '../simulation/createWorld.js';

export function EcosystemScene({ simulationEngine }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create 3D world with simulation engine for raycasting
    const world = createEcosystemWorld(containerRef.current, simulationEngine);

    let animationFrameId;
    let lastTime = performance.now();

    // Main render & update loop
    const animate = (now) => {
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Update simulation logic
      simulationEngine.update(deltaTime);

      // Render 3D scene & sync entity positions
      world.syncRender(simulationEngine);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      world.cleanup();
    };
  }, [simulationEngine]);

  return (
    <div className="scene-container">
      <div ref={containerRef} className="webgl-viewport" />
      <div className="viewport-overlay-hint">
        <span>👆 Click animal to inspect</span>
        <span>•</span>
        <span>🖱️ Drag to rotate view</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
        <span>•</span>
        <span>🖐️ Shift + Drag to pan</span>
      </div>
    </div>
  );
}
