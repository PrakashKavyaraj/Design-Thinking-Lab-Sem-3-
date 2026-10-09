// Rabbit Entity and Behavior Logic

import { HALF_WORLD, POND, RABBIT_CONFIG } from './constants.js';

let rabbitIdCounter = 1;

export class Rabbit {
  constructor(x, z, energy = RABBIT_CONFIG.INITIAL_ENERGY) {
    this.id = `rabbit_${rabbitIdCounter++}`;
    this.species = 'rabbit';
    this.x = x;
    this.z = z;
    this.rotation = Math.random() * Math.PI * 2;
    this.energy = energy;
    this.age = 0;
    this.isDead = false;
    this.state = 'WANDERING'; // 'WANDERING', 'SEEKING_FOOD', 'EATING'

    // Direction vector
    this.vx = Math.cos(this.rotation);
    this.vz = Math.sin(this.rotation);
    this.wanderTimer = Math.random() * 2;
    this.eatCooldown = 0;
  }

  update(deltaTime, grassSystem, totalRabbitCount, birthQueue) {
    if (this.isDead) return;

    // Age and energy decay
    this.age += deltaTime;
    this.energy -= RABBIT_CONFIG.ENERGY_DECAY_RATE * deltaTime;
    if (this.eatCooldown > 0) this.eatCooldown -= deltaTime;

    // Check death conditions
    if (this.energy <= 0 || this.age >= RABBIT_CONFIG.MAX_AGE) {
      this.isDead = true;
      return;
    }

    // Reproduction check
    if (
      this.energy >= RABBIT_CONFIG.REPRODUCTION_THRESHOLD &&
      this.age >= RABBIT_CONFIG.MATURITY_AGE &&
      totalRabbitCount < RABBIT_CONFIG.MAX_POPULATION
    ) {
      this.reproduce(birthQueue);
    }

    // Behavior state decision
    let target = null;

    if (this.energy < 85) {
      target = grassSystem.findNearestMatureGrass(
        this.x,
        this.z,
        RABBIT_CONFIG.PERCEPTION_RADIUS
      );
    }

    if (target) {
      this.state = 'SEEKING_FOOD';
      const dx = target.x - this.x;
      const dz = target.z - this.z;
      const dist = Math.hypot(dx, dz);

      if (dist < RABBIT_CONFIG.EAT_RADIUS) {
        this.state = 'EATING';
        if (this.eatCooldown <= 0) {
          const eaten = grassSystem.consumeGrassAt(this.x, this.z, 0.4);
          if (eaten > 0) {
            this.energy = Math.min(
              RABBIT_CONFIG.MAX_ENERGY,
              this.energy + RABBIT_CONFIG.EAT_ENERGY_GAIN * eaten
            );
            this.eatCooldown = 0.8; // Pause briefly while eating
          }
        }
      } else {
        // Move towards grass
        this.vx = dx / dist;
        this.vz = dz / dist;
        this.rotation = Math.atan2(this.vz, this.vx);
        this.move(deltaTime, RABBIT_CONFIG.SPEED);
      }
    } else {
      // Wander randomly
      this.state = 'WANDERING';
      this.wanderTimer -= deltaTime;
      if (this.wanderTimer <= 0) {
        this.rotation += (Math.random() - 0.5) * 1.5;
        this.vx = Math.cos(this.rotation);
        this.vz = Math.sin(this.rotation);
        this.wanderTimer = 1.5 + Math.random() * 2.5;
      }
      this.move(deltaTime, RABBIT_CONFIG.SPEED * 0.7);
    }

    // Keep inside bounds & avoid pond
    this.enforceBoundaries();
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

    // Pond avoidance
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
    this.energy -= RABBIT_CONFIG.REPRODUCTION_COST;
    // Spawn baby close by
    const offsetX = (Math.random() - 0.5) * 3;
    const offsetZ = (Math.random() - 0.5) * 3;
    const babyX = Math.max(-HALF_WORLD + 3, Math.min(HALF_WORLD - 3, this.x + offsetX));
    const babyZ = Math.max(-HALF_WORLD + 3, Math.min(HALF_WORLD - 3, this.z + offsetZ));

    birthQueue.push(new Rabbit(babyX, babyZ, RABBIT_CONFIG.INITIAL_ENERGY * 0.7));
  }
}
