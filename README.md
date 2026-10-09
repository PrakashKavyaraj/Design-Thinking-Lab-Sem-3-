# TerraSim — Interactive Ecosystem Simulator

TerraSim is an interactive 3D ecosystem simulator built to demonstrate emergent population dynamics, resource consumption, and predator-prey interactions from individual entity behaviors.

---

## 🌿 Project Overview

TerraSim models a closed natural ecosystem consisting of three core trophic levels:
1. **Grass System (Primary Producer)** — Regenerating natural food resource across terrain patches.
2. **Rabbits (Herbivores / Prey)** — Autonomous animals that wander, seek mature grass patches, consume energy, reproduce, and decay over time.
3. **Foxes (Carnivores / Predators)** — Sleek predators that scan for prey, pursue rabbits, consume caught entities to regain energy, reproduce, and decay over time.

All global population fluctuations result strictly from local behavioral rules and continuous simulation logic rather than fabricated data curves or hard-coded animations.

---

## 🚀 Technologies Used

- **React 19** — User interface components, dashboard state management, and user input validation.
- **Vite** — High-performance frontend build tool and dev server.
- **Three.js** — Direct WebGL 3D rendering for procedural terrain, lighting, camera orbit controls, and low-poly 3D entity models.
- **Vanilla JavaScript Modules** — Decoupled, pure mathematical simulation engine.
- **HTML5 & CSS3** — Responsive dark forest aesthetic scientific dashboard layout.

---

## 🛠️ Installation & Setup

1. **Clone or Open Project Directory:**
   ```bash
   cd /Users/prakashkavyaraj/Downloads/TerraSim
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Launch Development Server:**
   ```bash
   npm run dev
   ```

4. **Access in Browser:**
   Open the printed localhost URL (e.g., `http://localhost:5173/`).

---

## 📁 Project Folder Structure

```
TerraSim/
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── src/
    ├── App.jsx                      # Main dashboard layout container
    ├── main.jsx                     # Application entry point
    ├── index.css                    # Base global reset styles
    ├── styles.css                   # Custom dark forest design system & dashboard CSS
    ├── components/
    │   ├── Header.jsx               # Application header with title and description
    │   ├── EcosystemScene.jsx       # Canvas container & animation frame update loop
    │   ├── PopulationStats.jsx      # Real-time population metrics & status cards
    │   ├── SimulationControls.jsx   # Interactive control panel (Start, Pause, Reset, Inputs, Speed)
    │   └── StatusIndicator.jsx      # Dynamic simulation state badge (Active, Paused, Extinct)
    └── simulation/
        ├── constants.js             # Ecological constants, world boundaries, & thresholds
        ├── createWorld.js           # Three.js scene, lighting, terrain, pond, trees, & 3D models
        ├── grassSystem.js           # Resource grid allocation, growth, & consumption logic
        ├── rabbitBehavior.js        # Herbivore AI state machine (Wander, Seek Food, Eat, Reproduce, Die)
        ├── foxBehavior.js           # Predator AI state machine (Wander, Hunt, Catch, Eat, Reproduce, Die)
        └── simulationEngine.js      # Central simulation runner maintaining state & entity queues
```

---

## ⚙️ Simulation Architecture & Rules

### 1. Grass Resource Mechanics
- Terrain is divided into a 20x20 grid of grass patches.
- Grass continuously regenerates up to a maximum energy capacity (1.0).
- Patches inside the pond area are rendered impassable with zero grass growth.
- Rabbits consume 0.4 energy units per bite when feeding.

### 2. Rabbit Mechanics (Herbivore)
- **State Machine:** `WANDERING` → `SEEKING_FOOD` → `EATING`
- **Perception Radius:** 14 units.
- **Energy:** Starts at 65, decays at 3.2 units/sec. Max 100.
- **Feeding:** Eating grass restores +30 energy.
- **Reproduction:** When energy ≥ 80 and age ≥ 5s, spawns an offspring nearby (-40 energy cost).
- **Mortality:** Dies if energy drops to 0 or age exceeds 70s.

### 3. Fox Mechanics (Predator)
- **State Machine:** `WANDERING` → `HUNTING` → `EATING`
- **Perception Radius:** 22 units. Catch Radius: 1.8 units.
- **Speed:** Faster than rabbits (6.2 vs 4.8 units/sec).
- **Energy:** Starts at 75, decays at 4.5 units/sec. Max 120.
- **Hunting:** Chases closest active rabbit entity. On catch, removes rabbit from entity pool and gains +55 energy.
- **Reproduction:** When energy ≥ 95 and age ≥ 8s, spawns an offspring nearby (-50 energy cost).
- **Mortality:** Dies if energy drops to 0 or age exceeds 85s.

---

## 📌 Current Development Status (Part 1 - Complete)

- [x] **Stage 1:** Project structure, Vite + React setup, Three.js 3D terrain environment, lighting, pond, procedural trees, and camera orbit controls.
- [x] **Stage 2:** Procedural 3D animal models (Rabbit & Fox), simulation entity state machine, movement boundaries, and constants configuration.
- [x] **Stage 3:** Grass resource grid system with capacity, growth, consumption, and rabbit foraging behavior.
- [x] **Stage 4:** Fox predator-prey hunting logic, real entity removal on catch, birth/death mutation queues.
- [x] **Stage 5:** Live statistics panel (counts, births, deaths, grass level %, runtime), input validation, start, pause, resume, reset, and speed multiplier controls.

---

## 🔮 Planned Part 2 Extensions (Future Scope)

- Dynamic population charts & Lotka-Volterra phase plots.
- Weather cycles (Rain, Drought, Night/Day cycle).
- Natural language command interpretation.
- Entity selection & individual animal camera tracking inspector.
