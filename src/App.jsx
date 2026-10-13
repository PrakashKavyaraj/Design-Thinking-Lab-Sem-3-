import React, { useState, useEffect, useMemo } from 'react';
import { SimulationEngine } from './simulation/simulationEngine.js';
import { Header } from './components/Header.jsx';
import { EcosystemScene } from './components/EcosystemScene.jsx';
import { PopulationStats } from './components/PopulationStats.jsx';
import { SimulationControls } from './components/SimulationControls.jsx';
import { StatusIndicator } from './components/StatusIndicator.jsx';
import { PopulationChart } from './components/PopulationChart.jsx';
import { EntityInspector } from './components/EntityInspector.jsx';
import { CommandBar } from './components/CommandBar.jsx';
import './styles.css';

export function App() {
  const engine = useMemo(() => new SimulationEngine(), []);
  const [simState, setSimState] = useState(() => engine.getState());
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    const unsubscribe = engine.subscribe((newState) => {
      setSimState(newState);
    });

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

  const handleSetWeather = (type) => {
    engine.weatherSystem.setWeather(type);
    engine.notifyListeners();
  };

  const handleSpawnRabbits = (count) => {
    engine.spawnRabbits(count);
  };

  const handleSpawnFoxes = (count) => {
    engine.spawnFoxes(count);
  };

  const handleExecuteCommand = (cmdText) => {
    return engine.executeCommand(cmdText);
  };

  const handleToggleFollow = () => {
    engine.toggleFollowCamera();
  };

  const handleCloseInspector = () => {
    engine.deselectEntity();
  };

  return (
    <div className="app-container">
      <Header />

      <div className="dashboard-grid">
        {/* Top Control Bar: Status Indicator + Natural Language Command Bar */}
        <div className="top-bar">
          <StatusIndicator
            statusMessage={simState.statusMessage}
            isRunning={simState.isRunning}
            isPaused={simState.isPaused}
            speed={simState.speedMultiplier}
            weather={simState.weather}
          />
          <CommandBar onExecuteCommand={handleExecuteCommand} />
        </div>

        {/* Viewport and Metrics Panel */}
        <div className="viewport-and-stats">
          <div className="viewport-wrapper">
            <EcosystemScene simulationEngine={engine} />
            {simState.selectedEntity && (
              <EntityInspector
                entity={simState.selectedEntity}
                followCamera={simState.followCamera}
                onToggleFollow={handleToggleFollow}
                onClose={handleCloseInspector}
              />
            )}
          </div>
          <div className="side-analytics">
            <PopulationStats state={simState} />
            {showChart && <PopulationChart history={simState.history} />}
          </div>
        </div>

        {/* Simulation Controls Bottom Bar */}
        <SimulationControls
          isRunning={simState.isRunning}
          isPaused={simState.isPaused}
          speed={simState.speedMultiplier}
          weather={simState.weather}
          showChart={showChart}
          onStart={handleStart}
          onTogglePause={handleTogglePause}
          onReset={handleReset}
          onSetSpeed={handleSetSpeed}
          onSetWeather={handleSetWeather}
          onSpawnRabbits={handleSpawnRabbits}
          onSpawnFoxes={handleSpawnFoxes}
          onToggleChart={() => setShowChart(!showChart)}
        />
      </div>
    </div>
  );
}

export default App;
