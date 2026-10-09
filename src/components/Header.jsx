import React from 'react';

export function Header() {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-icon">🌿</div>
        <div>
          <h1 className="app-title">TerraSim</h1>
          <p className="app-subtitle">Interactive Ecosystem Simulation</p>
        </div>
      </div>
      <div className="header-desc">
        Observe emergent predator-prey dynamics, resource regeneration, and species survival in real time.
      </div>
    </header>
  );
}
