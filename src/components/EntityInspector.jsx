import React from 'react';

export function EntityInspector({ entity, followCamera, onToggleFollow, onClose }) {
  if (!entity) return null;

  const energyPercent = Math.min(100, Math.max(0, (entity.energy / entity.maxEnergy) * 100));
  const isFox = entity.species.toLowerCase() === 'fox';

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="inspector-title">
          <span className="inspector-icon">{isFox ? '🦊' : '🐇'}</span>
          <div>
            <h4>{entity.species} Inspection</h4>
            <span className="inspector-id">ID: {entity.id}</span>
          </div>
        </div>
        <button className="btn-close" onClick={onClose} title="Close inspector">✕</button>
      </div>

      <div className="inspector-body">
        <div className="inspector-row">
          <span className="inspector-label">Current State:</span>
          <span className={`state-badge state-${entity.state.toLowerCase()}`}>
            {entity.state}
          </span>
        </div>

        <div className="inspector-row energy-row">
          <div className="energy-labels">
            <span className="inspector-label">Energy Level:</span>
            <span className="energy-value">{entity.energy} / {entity.maxEnergy}</span>
          </div>
          <div className="inspector-progress-bg">
            <div
              className={`inspector-progress-fill ${isFox ? 'fox-fill' : 'rabbit-fill'}`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>

        <div className="inspector-row">
          <span className="inspector-label">Age / Lifespan:</span>
          <span className="inspector-val">{entity.age}s / {entity.maxAge}s</span>
        </div>

        <div className="inspector-row">
          <span className="inspector-label">Coordinates:</span>
          <span className="inspector-val">({entity.x}, {entity.z})</span>
        </div>

        <button
          className={`btn-follow ${followCamera ? 'following' : ''}`}
          onClick={onToggleFollow}
        >
          {followCamera ? '🎥 Tracking Camera Active' : '📹 Follow with Camera'}
        </button>
      </div>
    </div>
  );
}
