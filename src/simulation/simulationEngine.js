// Central Simulation Engine for TerraSim

import { HALF_WORLD, POND, RABBIT_CONFIG, FOX_CONFIG } from './constants.js';
import { GrassSystem } from './grassSystem.js';
import { Rabbit } from './rabbitBehavior.js';
import { Fox } from './foxBehavior.js';

export class SimulationEngine {
  constructor() {
    this.grassSystem = new GrassSystem();
    this.rabbits = [];
    this.foxes = [];
    this.timeElapsed = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.speedMultiplier = 1.0;

    // Detailed tracking statistics
    this.stats = {
      rabbitBirths: 0,
      rabbitDeaths: 0,
      foxBirths: 0,
      foxDeaths: 0
    };

    this.listeners = new Set();
  }

  init(initialRabbits = RABBIT_CONFIG.DEFAULT_INITIAL, initialFoxes = FOX_CONFIG.DEFAULT_INITIAL) {
    this.grassSystem.init();
    this.rabbits = [];
    this.foxes = [];
    this.timeElapsed = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.stats = {
      rabbitBirths: 0,
      rabbitDeaths: 0,
      foxBirths: 0,
      foxDeaths: 0
    };

    // Spawn initial Rabbits
    for (let i = 0; i < initialRabbits; i++) {
      const pos = this.getRandomLandPosition();
      this.rabbits.push(new Rabbit(pos.x, pos.z));
    }

    // Spawn initial Foxes
    for (let i = 0; i < initialFoxes; i++) {
      const pos = this.getRandomLandPosition();
      this.foxes.push(new Fox(pos.x, pos.z));
    }

    this.notifyListeners();
  }

  getRandomLandPosition() {
    let x, z, dist;
    const margin = 5;
    do {
      x = (Math.random() - 0.5) * (HALF_WORLD * 2 - margin * 2);
      z = (Math.random() - 0.5) * (HALF_WORLD * 2 - margin * 2);
      dist = Math.hypot(x - POND.x, z - POND.z);
    } while (dist < POND.radius + 3);

    return { x, z };
  }

  update(realDeltaTime) {
    if (!this.isRunning || this.isPaused) return;

    // Cap delta time to avoid large jumps when tab is inactive
    const clampedDelta = Math.min(realDeltaTime, 0.1);
    const dt = clampedDelta * this.speedMultiplier;

    this.timeElapsed += dt;

    // 1. Update Grass
    this.grassSystem.update(dt);

    // Queues for safe mutations during updates
    const rabbitBirths = [];
    const foxBirths = [];

    // 2. Update Rabbits
    for (let i = 0; i < this.rabbits.length; i++) {
      this.rabbits[i].update(dt, this.grassSystem, this.rabbits.length, rabbitBirths);
    }

    // 3. Update Foxes
    for (let i = 0; i < this.foxes.length; i++) {
      this.foxes[i].update(dt, this.rabbits, this.foxes.length, foxBirths);
    }

    // 4. Process Deaths safely
    const deadRabbitCount = this.rabbits.filter((r) => r.isDead).length;
    if (deadRabbitCount > 0) {
      this.stats.rabbitDeaths += deadRabbitCount;
      this.rabbits = this.rabbits.filter((r) => !r.isDead);
    }

    const deadFoxCount = this.foxes.filter((f) => f.isDead).length;
    if (deadFoxCount > 0) {
      this.stats.foxDeaths += deadFoxCount;
      this.foxes = this.foxes.filter((f) => !f.isDead);
    }

    // 5. Process Births safely
    if (rabbitBirths.length > 0) {
      this.stats.rabbitBirths += rabbitBirths.length;
      this.rabbits.push(...rabbitBirths);
    }

    if (foxBirths.length > 0) {
      this.stats.foxBirths += foxBirths.length;
      this.foxes.push(...foxBirths);
    }

    this.notifyListeners();
  }

  setPaused(paused) {
    this.isPaused = paused;
    this.notifyListeners();
  }

  setSpeed(speed) {
    this.speedMultiplier = speed;
    this.notifyListeners();
  }

  getState() {
    return {
      timeElapsed: Math.floor(this.timeElapsed),
      rabbitCount: this.rabbits.length,
      foxCount: this.foxes.length,
      grassLevel: Math.round(this.grassSystem.getAverageResourceLevel()),
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      speedMultiplier: this.speedMultiplier,
      stats: { ...this.stats },
      statusMessage: this.getStatusMessage()
    };
  }

  getStatusMessage() {
    if (!this.isRunning) return 'Ready to start';
    if (this.isPaused) return 'Simulation Paused';
    if (this.rabbits.length === 0 && this.foxes.length === 0) return 'Ecosystem Extinct';
    if (this.rabbits.length === 0) return 'Rabbits Extinct';
    if (this.foxes.length === 0) return 'Foxes Extinct';
    return 'Ecosystem Active';
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }
}
