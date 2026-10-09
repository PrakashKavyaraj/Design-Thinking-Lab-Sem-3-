// TerraSim Simulation Constants and Parameters

export const WORLD_SIZE = 80; // Terrain is 80x80 (-40 to +40)
export const HALF_WORLD = WORLD_SIZE / 2;

// Pond placement (impassable/water feature)
export const POND = {
  x: -12,
  z: -12,
  radius: 11
};

// Grass parameters
export const GRASS_CONFIG = {
  GRID_SIZE: 20, // 20x20 grid of grass patches
  PATCH_SIZE: WORLD_SIZE / 20, // 4x4 size per patch
  MAX_ENERGY: 1.0,
  INITIAL_ENERGY: 0.7,
  GROWTH_RATE: 0.05, // Energy gained per second
  EAT_AMOUNT: 0.4 // Energy consumed in one bite
};

// Rabbit parameters
export const RABBIT_CONFIG = {
  DEFAULT_INITIAL: 25,
  MAX_POPULATION: 250,
  SPEED: 4.8,
  PERCEPTION_RADIUS: 14.0,
  EAT_RADIUS: 1.8,
  MAX_ENERGY: 100,
  INITIAL_ENERGY: 65,
  ENERGY_DECAY_RATE: 3.2, // Energy lost per second
  EAT_ENERGY_GAIN: 30,
  REPRODUCTION_THRESHOLD: 80,
  REPRODUCTION_COST: 40,
  MAX_AGE: 70, // Max age in simulation seconds
  MATURITY_AGE: 5
};

// Fox parameters
export const FOX_CONFIG = {
  DEFAULT_INITIAL: 6,
  MAX_POPULATION: 80,
  SPEED: 6.2,
  PERCEPTION_RADIUS: 22.0,
  CATCH_RADIUS: 1.8,
  MAX_ENERGY: 120,
  INITIAL_ENERGY: 75,
  ENERGY_DECAY_RATE: 4.5, // Energy lost per second
  EAT_ENERGY_GAIN: 55,
  REPRODUCTION_THRESHOLD: 95,
  REPRODUCTION_COST: 50,
  MAX_AGE: 85, // Max age in simulation seconds
  MATURITY_AGE: 8
};
