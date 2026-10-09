import React, { useState, useEffect, useMemo } from 'react';
import { SimulationEngine } from './simulation/simulationEngine.js';
import { Header } from './components/Header.jsx';
import { EcosystemScene } from './components/EcosystemScene.jsx';
import { PopulationStats } from './components/PopulationStats.jsx';
import { SimulationControls } from './components/SimulationControls.jsx';
import { StatusIndicator } from './components/StatusIndicator.jsx';
import './styles.css';

export function App() {
  // Create single instance of SimulationEngine
  const engine = useMemo(() => new SimulationEngine(), []);

  // React state reflecting simulation snapshot
  const [simState, setSimState] = useState(() => engine.getState());

  useEffect(() => {
    // Subscribe to engine state notifications
    const unsubscribe = engine.subscribe((newState) => {
      setSimState(newState);
    });

    // Auto-start simulation on first load with default populations
    engine.init(25, 6);

    return () => {
      unsubscribe();
    };
  }, [engine]);

  const handleStart = (rabbits, foxes) => {
    engine.init(rabbits, foxes);
  };

  const handleTogglePause = () => {
    engine.setPaused(!simState.isPaused);
  };

  const handleReset = (rabbits, foxes) => {
    engine.init(rabbits, foxes);
  };

  const handleSetSpeed = (speed) => {
    engine.setSpeed(speed);
  };

  return (
    <div className="app-container">
      <Header />

      <div className="dashboard-grid">
        <div className="top-bar">
          <StatusIndicator
            statusMessage={simState.statusMessage}
            isRunning={simState.isRunning}
            isPaused={simState.isPaused}
            speed={simState.speedMultiplier}
          />
        </div>

        <div className="viewport-and-stats">
          <EcosystemScene simulationEngine={engine} />
          <PopulationStats state={simState} />
        </div>

        <SimulationControls
          isRunning={simState.isRunning}
          isPaused={simState.isPaused}
          speed={simState.speedMultiplier}
          onStart={handleStart}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onSetSpeed={handleSetSpeed}
        />
      </div>
    </div>
  );
}

export default App;
