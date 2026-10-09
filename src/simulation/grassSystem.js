// Grass Resource Management System

import { WORLD_SIZE, HALF_WORLD, POND, GRASS_CONFIG } from './constants.js';

export class GrassSystem {
  constructor() {
    this.gridSize = GRASS_CONFIG.GRID_SIZE;
    this.patchSize = GRASS_CONFIG.PATCH_SIZE;
    this.patches = [];
    this.init();
  }

  init() {
    this.patches = [];
    const step = this.patchSize;
    const startOffset = -HALF_WORLD + step / 2;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const x = startOffset + c * step;
        const z = startOffset + r * step;

        // Check if inside pond
        const distToPond = Math.hypot(x - POND.x, z - POND.z);
        const inPond = distToPond < POND.radius + 1.0;

        this.patches.push({
          id: `grass_${r}_${c}`,
          row: r,
          col: c,
          x: x,
          z: z,
          energy: inPond ? 0 : GRASS_CONFIG.INITIAL_ENERGY,
          maxEnergy: GRASS_CONFIG.MAX_ENERGY,
          inPond: inPond
        });
      }
    }
  }

  update(deltaTime, growthMultiplier = 1.0) {
    const growth = GRASS_CONFIG.GROWTH_RATE * deltaTime * growthMultiplier;
    for (let i = 0; i < this.patches.length; i++) {
      const p = this.patches[i];
      if (!p.inPond && p.energy < p.maxEnergy) {
        p.energy = Math.min(p.maxEnergy, p.energy + growth);
      }
    }
  }

  getPatchAt(x, z) {
    const c = Math.floor((x + HALF_WORLD) / this.patchSize);
    const r = Math.floor((z + HALF_WORLD) / this.patchSize);
    if (r >= 0 && r < this.gridSize && c >= 0 && c < this.gridSize) {
      return this.patches[r * this.gridSize + c];
    }
    return null;
  }

  findNearestMatureGrass(x, z, radius) {
    let bestPatch = null;
    let minDistanceSq = radius * radius;

    for (let i = 0; i < this.patches.length; i++) {
      const p = this.patches[i];
      if (p.inPond || p.energy < 0.25) continue;

      const dx = p.x - x;
      const dz = p.z - z;
      const distSq = dx * dx + dz * dz;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestPatch = p;
      }
    }

    return bestPatch;
  }

  consumeGrassAt(x, z, amount = GRASS_CONFIG.EAT_AMOUNT) {
    const patch = this.getPatchAt(x, z);
    if (patch && !patch.inPond && patch.energy > 0.1) {
      const eaten = Math.min(patch.energy, amount);
      patch.energy -= eaten;
      return eaten;
    }
    return 0;
  }

  getAverageResourceLevel() {
    let total = 0;
    let count = 0;
    for (let i = 0; i < this.patches.length; i++) {
      const p = this.patches[i];
      if (!p.inPond) {
        total += p.energy;
        count++;
      }
    }
    return count > 0 ? (total / count) * 100 : 0;
  }
}
