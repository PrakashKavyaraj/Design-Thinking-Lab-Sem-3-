// Fox Entity and Behavior Logic

import { HALF_WORLD, POND, FOX_CONFIG } from './constants.js';

let foxIdCounter = 1;

export class Fox {
  constructor(x, z, energy = FOX_CONFIG.INITIAL_ENERGY) {
    this.id = `fox_${foxIdCounter++}`;
    this.species = 'fox';
    this.x = x;
    this.z = z;
    this.rotation = Math.random() * Math.PI * 2;
    this.energy = energy;
    this.age = 0;
    this.isDead = false;
    this.state = 'WANDERING'; // 'WANDERING', 'HUNTING', 'EATING'

    this.vx = Math.cos(this.rotation);
    this.vz = Math.sin(this.rotation);
    this.wanderTimer = Math.random() * 2;
    this.targetRabbit = null;
    this.huntCooldown = 0;
  }

  update(deltaTime, rabbits, totalFoxCount, birthQueue) {
    if (this.isDead) return;

    // Age & energy decay
    this.age += deltaTime;
    this.energy -= FOX_CONFIG.ENERGY_DECAY_RATE * deltaTime;
    if (this.huntCooldown > 0) this.huntCooldown -= deltaTime;

    // Check death conditions
    if (this.energy <= 0 || this.age >= FOX_CONFIG.MAX_AGE) {
      this.isDead = true;
      return;
    }

    // Reproduction check
    if (
      this.energy >= FOX_CONFIG.REPRODUCTION_THRESHOLD &&
      this.age >= FOX_CONFIG.MATURITY_AGE &&
      totalFoxCount < FOX_CONFIG.MAX_POPULATION
    ) {
      this.reproduce(birthQueue);
    }

    // Find prey (nearest alive rabbit within perception range)
    this.targetRabbit = this.findNearestPrey(rabbits);

    if (this.targetRabbit && !this.targetRabbit.isDead) {
      this.state = 'HUNTING';
      const dx = this.targetRabbit.x - this.x;
      const dz = this.targetRabbit.z - this.z;
      const dist = Math.hypot(dx, dz);

      if (dist < FOX_CONFIG.CATCH_RADIUS) {
        // Catch and consume rabbit
        this.state = 'EATING';
        this.targetRabbit.isDead = true; // Remove from active prey
        this.energy = Math.min(
          FOX_CONFIG.MAX_ENERGY,
          this.energy + FOX_CONFIG.EAT_ENERGY_GAIN
        );
        this.targetRabbit = null;
        this.huntCooldown = 0.5;
      } else {
        // Chase rabbit
        this.vx = dx / dist;
        this.vz = dz / dist;
        this.rotation = Math.atan2(this.vz, this.vx);
        this.move(deltaTime, FOX_CONFIG.SPEED);
      }
    } else {
      // Wander around searching for prey
      this.state = 'WANDERING';
      this.wanderTimer -= deltaTime;
      if (this.wanderTimer <= 0) {
        this.rotation += (Math.random() - 0.5) * 1.8;
        this.vx = Math.cos(this.rotation);
        this.vz = Math.sin(this.rotation);
        this.wanderTimer = 1.0 + Math.random() * 2.0;
      }
      this.move(deltaTime, FOX_CONFIG.SPEED * 0.65);
    }

    // Keep inside bounds & avoid pond
    this.enforceBoundaries();
  }

  findNearestPrey(rabbits) {
    let nearest = null;
    let minDistanceSq = FOX_CONFIG.PERCEPTION_RADIUS * FOX_CONFIG.PERCEPTION_RADIUS;

    for (let i = 0; i < rabbits.length; i++) {
      const r = rabbits[i];
      if (r.isDead) continue;

      const dx = r.x - this.x;
      const dz = r.z - this.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearest = r;
      }
    }

    return nearest;
  }

  move(deltaTime, speed) {
    this.x += this.vx * speed * deltaTime;
    this.z += this.vz * speed * deltaTime;
  }

  enforceBoundaries() {
    const bound = HALF_WORLD - 3;
    let hitBound = false;

    if (this.x < -bound) { this.x = -bound; this.vx *= -1; hitBound = true; }
    if (this.x > bound) { this.x = bound; this.vx *= -1; hitBound = true; }
    if (this.z < -bound) { this.z = -bound; this.vz *= -1; hitBound = true; }
    if (this.z > bound) { this.z = bound; this.vz *= -1; hitBound = true; }

    // Avoid pond
    const pdx = this.x - POND.x;
    const pdz = this.z - POND.z;
    const pdist = Math.hypot(pdx, pdz);
    if (pdist < POND.radius + 1.5) {
      const pushX = pdx / pdist;
      const pushZ = pdz / pdist;
      this.x = POND.x + pushX * (POND.radius + 1.5);
      this.z = POND.z + pushZ * (POND.radius + 1.5);
      this.vx = pushX;
      this.vz = pushZ;
      hitBound = true;
    }

    if (hitBound) {
      this.rotation = Math.atan2(this.vz, this.vx);
    }
  }

  reproduce(birthQueue) {
    this.energy -= FOX_CONFIG.REPRODUCTION_COST;
    const offsetX = (Math.random() - 0.5) * 4;
    const offsetZ = (Math.random() - 0.5) * 4;
    const babyX = Math.max(-HALF_WORLD + 3, Math.min(HALF_WORLD - 3, this.x + offsetX));
    const babyZ = Math.max(-HALF_WORLD + 3, Math.min(HALF_WORLD - 3, this.z + offsetZ));

    birthQueue.push(new Fox(babyX, babyZ, FOX_CONFIG.INITIAL_ENERGY * 0.7));
  }
}
