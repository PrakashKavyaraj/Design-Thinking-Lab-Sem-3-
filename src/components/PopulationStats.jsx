import React from 'react';

export function PopulationStats({ state }) {
  const { timeElapsed, rabbitCount, foxCount, grassLevel, stats } = state;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-icon rabbit-icon">🐇</span>
          <span className="stat-label">Rabbits</span>
        </div>
        <div className="stat-value rabbit-color">{rabbitCount}</div>
        <div className="stat-sub">
          <span>Births: {stats?.rabbitBirths || 0}</span>
          <span>Deaths: {stats?.rabbitDeaths || 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-icon fox-icon">🦊</span>
          <span className="stat-label">Foxes</span>
        </div>
        <div className="stat-value fox-color">{foxCount}</div>
        <div className="stat-sub">
          <span>Births: {stats?.foxBirths || 0}</span>
          <span>Deaths: {stats?.foxDeaths || 0}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-icon grass-icon">🌱</span>
          <span className="stat-label">Grass Resource</span>
        </div>
        <div className="stat-value grass-color">{grassLevel}%</div>
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, Math.max(0, grassLevel))}%` }}
          ></div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-icon time-icon">⏱️</span>
          <span className="stat-label">Simulation Time</span>
        </div>
        <div className="stat-value time-color">{formatTime(timeElapsed)}</div>
        <div className="stat-sub">
          <span>Live Runtime</span>
        </div>
      </div>
    </div>
  );
}
