import React, { useState } from 'react';

export function SimulationControls({
  isRunning,
  isPaused,
  speed,
  onStart,
  onTogglePause,
  onReset,
  onSetSpeed
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

  return (
    <div className="controls-panel">
      <div className="controls-row">
        <div className="input-group">
          <label htmlFor="init-rabbits">Initial Rabbits:</label>
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
          <label htmlFor="init-foxes">Initial Foxes:</label>
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
          {isRunning ? '🔄 Reset World' : '▶ Start Simulation'}
        </button>

        {isRunning && (
          <button
            className={`btn ${isPaused ? 'btn-resume' : 'btn-pause'}`}
            onClick={onTogglePause}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        )}
      </div>

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
      </div>
    </div>
  );
}
