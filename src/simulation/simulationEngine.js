// Central Simulation Engine for TerraSim (Part 2 Enhanced)

import { HALF_WORLD, POND, RABBIT_CONFIG, FOX_CONFIG } from './constants.js';
import { GrassSystem } from './grassSystem.js';
import { Rabbit } from './rabbitBehavior.js';
import { Fox } from './foxBehavior.js';
import { WeatherSystem, WEATHER_TYPES } from './weatherSystem.js';

export class SimulationEngine {
  constructor() {
    this.grassSystem = new GrassSystem();
    this.weatherSystem = new WeatherSystem();
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

    // Historical trend samples for real-time charting
    this.history = [];
    this.historySampleTimer = 0;

    // Entity inspection & camera tracking
    this.selectedEntityId = null;
    this.followCamera = false;

    this.listeners = new Set();
  }

  init(initialRabbits = RABBIT_CONFIG.DEFAULT_INITIAL, initialFoxes = FOX_CONFIG.DEFAULT_INITIAL) {
    this.grassSystem.init();
    this.weatherSystem.setWeather(WEATHER_TYPES.SUNNY);
    this.rabbits = [];
    this.foxes = [];
    this.history = [];
    this.historySampleTimer = 0;
    this.selectedEntityId = null;
    this.followCamera = false;
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

    // Initial history snapshot
    this.recordHistory();
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

    // 1. Update Weather System
    this.weatherSystem.update(dt);
    const multipliers = this.weatherSystem.getMultipliers();

    // 2. Update Grass with weather growth multiplier
    this.grassSystem.update(dt, multipliers.grassGrowth);

    // Queues for safe mutations during updates
    const rabbitBirths = [];
    const foxBirths = [];

    // 3. Update Rabbits with weather energy decay multiplier
    for (let i = 0; i < this.rabbits.length; i++) {
      this.rabbits[i].update(
        dt,
        this.grassSystem,
        this.rabbits.length,
        rabbitBirths,
        multipliers.rabbitEnergyDecay
      );
    }

    // 4. Update Foxes with weather perception multiplier
    for (let i = 0; i < this.foxes.length; i++) {
      this.foxes[i].update(
        dt,
        this.rabbits,
        this.foxes.length,
        foxBirths,
        multipliers.foxPerception
      );
    }

    // 5. Process Deaths safely
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

    // 6. Process Births safely
    if (rabbitBirths.length > 0) {
      this.stats.rabbitBirths += rabbitBirths.length;
      this.rabbits.push(...rabbitBirths);
    }

    if (foxBirths.length > 0) {
      this.stats.foxBirths += foxBirths.length;
      this.foxes.push(...foxBirths);
    }

    // 7. Sample history for real-time population chart every ~1 second
    this.historySampleTimer += dt;
    if (this.historySampleTimer >= 1.0) {
      this.historySampleTimer = 0;
      this.recordHistory();
    }

    this.notifyListeners();
  }

  recordHistory() {
    this.history.push({
      time: Math.floor(this.timeElapsed),
      rabbits: this.rabbits.length,
      foxes: this.foxes.length,
      grass: Math.round(this.grassSystem.getAverageResourceLevel())
    });

    // Keep up to 60 historical samples for chart performance
    if (this.history.length > 60) {
      this.history.shift();
    }
  }

  // --- Entity Selection & Tracking ---
  selectEntity(id) {
    this.selectedEntityId = id;
    this.notifyListeners();
  }

  deselectEntity() {
    this.selectedEntityId = null;
    this.followCamera = false;
    this.notifyListeners();
  }

  toggleFollowCamera() {
    this.followCamera = !this.followCamera;
    this.notifyListeners();
  }

  getSelectedEntity() {
    if (!this.selectedEntityId) return null;
    const rabbit = this.rabbits.find((r) => r.id === this.selectedEntityId);
    if (rabbit) {
      return {
        id: rabbit.id,
        species: 'Rabbit',
        x: rabbit.x.toFixed(1),
        z: rabbit.z.toFixed(1),
        energy: Math.round(rabbit.energy),
        maxEnergy: RABBIT_CONFIG.MAX_ENERGY,
        age: Math.round(rabbit.age),
        maxAge: RABBIT_CONFIG.MAX_AGE,
        state: rabbit.state,
        isDead: rabbit.isDead
      };
    }
    const fox = this.foxes.find((f) => f.id === this.selectedEntityId);
    if (fox) {
      return {
        id: fox.id,
        species: 'Fox',
        x: fox.x.toFixed(1),
        z: fox.z.toFixed(1),
        energy: Math.round(fox.energy),
        maxEnergy: FOX_CONFIG.MAX_ENERGY,
        age: Math.round(fox.age),
        maxAge: FOX_CONFIG.MAX_AGE,
        state: fox.state,
        isDead: fox.isDead
      };
    }
    return null;
  }

  // --- Population Injection Methods ---
  spawnRabbits(count = 10) {
    const toAdd = Math.min(count, RABBIT_CONFIG.MAX_POPULATION - this.rabbits.length);
    for (let i = 0; i < toAdd; i++) {
      const pos = this.getRandomLandPosition();
      this.rabbits.push(new Rabbit(pos.x, pos.z));
    }
    this.stats.rabbitBirths += toAdd;
    this.notifyListeners();
    return toAdd;
  }

  spawnFoxes(count = 3) {
    const toAdd = Math.min(count, FOX_CONFIG.MAX_POPULATION - this.foxes.length);
    for (let i = 0; i < toAdd; i++) {
      const pos = this.getRandomLandPosition();
      this.foxes.push(new Fox(pos.x, pos.z));
    }
    this.stats.foxBirths += toAdd;
    this.notifyListeners();
    return toAdd;
  }

  clearFoxes() {
    const count = this.foxes.length;
    this.foxes = [];
    this.stats.foxDeaths += count;
    this.notifyListeners();
    return count;
  }

  boostGrass() {
    for (let i = 0; i < this.grassSystem.patches.length; i++) {
      const p = this.grassSystem.patches[i];
      if (!p.inPond) {
        p.energy = p.maxEnergy;
      }
    }
    this.notifyListeners();
  }

  // --- Natural-Language Command Rule-Based Parser ---
  executeCommand(rawText) {
    if (!rawText || !rawText.trim()) return { success: false, message: 'Empty command' };
    const text = rawText.toLowerCase().trim();

    // 1. Weather Commands
    if (text.includes('rain') || text.includes('storm')) {
      this.weatherSystem.setWeather(WEATHER_TYPES.RAIN);
      this.notifyListeners();
      return { success: true, message: '🌧️ Weather changed to Rainstorm! Grass growth boosted.' };
    }
    if (text.includes('drought') || text.includes('dry') || text.includes('heat')) {
      this.weatherSystem.setWeather(WEATHER_TYPES.DROUGHT);
      this.notifyListeners();
      return { success: true, message: '🌵 Weather changed to Drought! Arid conditions active.' };
    }
    if (text.includes('night') || text.includes('dark') || text.includes('moon')) {
      this.weatherSystem.setWeather(WEATHER_TYPES.NIGHT);
      this.notifyListeners();
      return { success: true, message: '🌙 Night mode activated! Predators have night vision.' };
    }
    if (text.includes('sun') || text.includes('clear') || text.includes('day')) {
      this.weatherSystem.setWeather(WEATHER_TYPES.SUNNY);
      this.notifyListeners();
      return { success: true, message: '☀️ Weather cleared to Sunny.' };
    }

    // 2. Population Spawning Commands
    const rabbitMatch = text.match(/(?:spawn|add|create|\+)\s*(\d+)?\s*rabbits?/);
    if (rabbitMatch || text.includes('more rabbits')) {
      const count = rabbitMatch && rabbitMatch[1] ? parseInt(rabbitMatch[1], 10) : 10;
      const added = this.spawnRabbits(count);
      return { success: true, message: `🐇 Spawned ${added} rabbits into the ecosystem!` };
    }

    const foxMatch = text.match(/(?:spawn|add|create|\+)\s*(\d+)?\s*fox(?:es)?/);
    if (foxMatch || text.includes('more foxes')) {
      const count = foxMatch && foxMatch[1] ? parseInt(foxMatch[1], 10) : 3;
      const added = this.spawnFoxes(count);
      return { success: true, message: `🦊 Spawned ${added} foxes into the ecosystem!` };
    }

    // 3. Extinction / Clearance Commands
    if (text.includes('kill foxes') || text.includes('remove foxes') || text.includes('clear foxes')) {
      const removed = this.clearFoxes();
      return { success: true, message: `🦊 Removed ${removed} foxes.` };
    }

    // 4. Grass Boost
    if (text.includes('boost grass') || text.includes('grow grass') || text.includes('max grass')) {
      this.boostGrass();
      return { success: true, message: '🌱 Grass fully replenished to 100%!' };
    }

    // 5. Controls (Speed, Pause, Resume, Reset)
    if (text.includes('pause') || text.includes('freeze') || text.includes('stop')) {
      this.setPaused(true);
      return { success: true, message: '⏸️ Simulation paused.' };
    }
    if (text.includes('resume') || text.includes('play') || text.includes('unpause')) {
      this.setPaused(false);
      return { success: true, message: '▶️ Simulation resumed.' };
    }
    if (text.includes('reset') || text.includes('restart')) {
      this.init();
      return { success: true, message: '🔄 World reset to initial state.' };
    }

    const speedMatch = text.match(/speed\s*(\d+)x?/);
    if (speedMatch && speedMatch[1]) {
      const s = parseInt(speedMatch[1], 10);
      this.setSpeed(s);
      return { success: true, message: `⚡ Speed set to ${s}x.` };
    }

    return {
      success: false,
      message: `Unknown command "${rawText}". Try: "make it rain", "spawn 10 rabbits", "start drought", "night mode".`
    };
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
      statusMessage: this.getStatusMessage(),
      weather: this.weatherSystem.getState(),
      history: [...this.history],
      selectedEntity: this.getSelectedEntity(),
      followCamera: this.followCamera
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
