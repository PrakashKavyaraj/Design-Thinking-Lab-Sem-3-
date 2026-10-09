import React from 'react';

export function StatusIndicator({ statusMessage, isRunning, isPaused, speed }) {
  let badgeClass = 'status-badge status-ready';

  if (!isRunning) {
    badgeClass = 'status-badge status-ready';
  } else if (isPaused) {
    badgeClass = 'status-badge status-paused';
  } else if (statusMessage.includes('Extinct')) {
    badgeClass = 'status-badge status-extinct';
  } else {
    badgeClass = 'status-badge status-active';
  }

  return (
    <div className="status-container">
      <div className={badgeClass}>
        <span className="status-dot"></span>
        <span className="status-text">{statusMessage}</span>
      </div>
      {isRunning && (
        <span className="speed-badge">{speed}x Speed</span>
      )}
    </div>
  );
}
