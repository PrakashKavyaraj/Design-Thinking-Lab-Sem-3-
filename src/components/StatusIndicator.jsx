import React from 'react';

export function StatusIndicator({ statusMessage, isRunning, isPaused, speed, weather }) {
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

  const currentWeather = weather?.currentWeather || 'SUNNY';
  const weatherIcons = {
    SUNNY: '☀️ Sunny',
    RAIN: '🌧️ Rainstorm',
    DROUGHT: '🌵 Drought',
    NIGHT: '🌙 Night'
  };

  return (
    <div className="status-container">
      <div className={badgeClass}>
        <span className="status-dot"></span>
        <span className="status-text">{statusMessage}</span>
      </div>
      {isRunning && (
        <>
          <span className="speed-badge">{speed}x Speed</span>
          <span className={`weather-badge weather-${currentWeather.toLowerCase()}`}>
            {weatherIcons[currentWeather] || currentWeather}
          </span>
        </>
      )}
    </div>
  );
}
