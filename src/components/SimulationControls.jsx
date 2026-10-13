import React, { useState } from 'react';
import { WEATHER_TYPES } from '../simulation/weatherSystem.js';

export function SimulationControls({
  isRunning,
  isPaused,
  speed,
  weather,
  showChart,
  onStart,
  onTogglePause,
  onReset,
  onSetSpeed,
  onSetWeather,
  onSpawnRabbits,
  onSpawnFoxes,
  onToggleChart
}) {
  const [initRabbits, setInitRabbits] = useState(25);
  const [initFoxes, setInitFoxes] = useState(6);

  const handleStartReset = () => {
    const rabbits = Math.max(1, Math.min(150, Number(initRabbits) || 25));
    const foxes = Math.max(0, Math.min(50, Number(initFoxes) || 6));
    if (isRunning) {
      onReset(rabbits, foxes);
    } else {
      onStart(rabbits, foxes);
    }
  };

  const currentWeather = weather?.currentWeather || WEATHER_TYPES.SUNNY;

  return (
    <div className="controls-panel">
      {/* Primary Actions Row */}
      <div className="controls-row">
        <div className="input-group">
          <label htmlFor="init-rabbits">Rabbits:</label>
          <input
            id="init-rabbits"
            type="number"
            min="1"
            max="150"
            value={initRabbits}
            onChange={(e) => setInitRabbits(e.target.value)}
            disabled={isRunning && !isPaused}
          />
        </div>

        <div className="input-group">
          <label htmlFor="init-foxes">Foxes:</label>
          <input
            id="init-foxes"
            type="number"
            min="0"
            max="50"
            value={initFoxes}
            onChange={(e) => setInitFoxes(e.target.value)}
            disabled={isRunning && !isPaused}
          />
        </div>

        <button
          className={`btn ${isRunning ? 'btn-reset' : 'btn-start'}`}
          onClick={handleStartReset}
        >
          {isRunning ? '🔄 Reset' : '▶ Start'}
        </button>

        {isRunning && (
          <button
            className={`btn ${isPaused ? 'btn-resume' : 'btn-pause'}`}
            onClick={onTogglePause}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}

        <div className="quick-inject-buttons">
          <button className="btn-mini" onClick={() => onSpawnRabbits(10)} title="Add 10 Rabbits">+10 🐇</button>
          <button className="btn-mini" onClick={() => onSpawnFoxes(3)} title="Add 3 Foxes">+3 🦊</button>
        </div>
      </div>

      {/* Weather & Environmental Events */}
      <div className="controls-row weather-controls">
        <span className="control-label">Weather:</span>
        <button
          className={`btn-weather ${currentWeather === WEATHER_TYPES.SUNNY ? 'active' : ''}`}
          onClick={() => onSetWeather(WEATHER_TYPES.SUNNY)}
          title="Sunny - standard regrowth"
        >
          ☀️ Sunny
        </button>
        <button
          className={`btn-weather ${currentWeather === WEATHER_TYPES.RAIN ? 'active' : ''}`}
          onClick={() => onSetWeather(WEATHER_TYPES.RAIN)}
          title="Rainstorm - fast grass regrowth"
        >
          🌧️ Rain
        </button>
        <button
          className={`btn-weather ${currentWeather === WEATHER_TYPES.DROUGHT ? 'active' : ''}`}
          onClick={() => onSetWeather(WEATHER_TYPES.DROUGHT)}
          title="Drought - arid, slow regrowth, high energy drain"
        >
          🌵 Drought
        </button>
        <button
          className={`btn-weather ${currentWeather === WEATHER_TYPES.NIGHT ? 'active' : ''}`}
          onClick={() => onSetWeather(WEATHER_TYPES.NIGHT)}
          title="Night - nocturnal predator advantage"
        >
          🌙 Night
        </button>
      </div>

      {/* Speed & Chart Toggle */}
      <div className="controls-row speed-controls">
        <span className="control-label">Speed:</span>
        {[1, 2, 5].map((s) => (
          <button
            key={s}
            className={`btn-speed ${speed === s ? 'active' : ''}`}
            onClick={() => onSetSpeed(s)}
          >
            {s}x
          </button>
        ))}

        <button
          className={`btn-chart-toggle ${showChart ? 'active' : ''}`}
          onClick={onToggleChart}
          title="Toggle population analytics chart"
        >
          📊 Chart {showChart ? '▲' : '▼'}
        </button>
      </div>
    </div>
  );
}
