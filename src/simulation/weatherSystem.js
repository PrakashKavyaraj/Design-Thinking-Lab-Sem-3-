// Weather and Environmental Event System for TerraSim

export const WEATHER_TYPES = {
  SUNNY: 'SUNNY',
  RAIN: 'RAIN',
  DROUGHT: 'DROUGHT',
  NIGHT: 'NIGHT'
};

export class WeatherSystem {
  constructor() {
    this.currentWeather = WEATHER_TYPES.SUNNY;
    this.timer = 0;
    this.duration = 45; // seconds per weather cycle in auto mode
    this.isAutoCycle = false;
  }

  setWeather(type) {
    if (WEATHER_TYPES[type]) {
      this.currentWeather = type;
      this.timer = 0;
    }
  }

  toggleAutoCycle() {
    this.isAutoCycle = !this.isAutoCycle;
  }

  update(deltaTime) {
    if (!this.isAutoCycle) return;

    this.timer += deltaTime;
    if (this.timer >= this.duration) {
      this.timer = 0;
      // Cycle through weathers
      const types = [
        WEATHER_TYPES.SUNNY,
        WEATHER_TYPES.RAIN,
        WEATHER_TYPES.SUNNY,
        WEATHER_TYPES.DROUGHT,
        WEATHER_TYPES.NIGHT
      ];
      const currentIndex = types.indexOf(this.currentWeather);
      const nextIndex = (currentIndex + 1) % types.length;
      this.currentWeather = types[nextIndex];
    }
  }

  getMultipliers() {
    switch (this.currentWeather) {
      case WEATHER_TYPES.RAIN:
        return {
          grassGrowth: 2.5,     // Rain boosts grass regrowth dramatically
          rabbitEnergyDecay: 0.9,
          foxPerception: 0.85
        };
      case WEATHER_TYPES.DROUGHT:
        return {
          grassGrowth: 0.15,    // Arid conditions stop grass growth
          rabbitEnergyDecay: 1.35, // Heat & thirst drain rabbit energy faster
          foxPerception: 1.0
        };
      case WEATHER_TYPES.NIGHT:
        return {
          grassGrowth: 0.5,
          rabbitEnergyDecay: 1.0,
          foxPerception: 1.25   // Nocturnal advantage for predators
        };
      case WEATHER_TYPES.SUNNY:
      default:
        return {
          grassGrowth: 1.0,
          rabbitEnergyDecay: 1.0,
          foxPerception: 1.0
        };
    }
  }

  getState() {
    return {
      currentWeather: this.currentWeather,
      isAutoCycle: this.isAutoCycle,
      multipliers: this.getMultipliers()
    };
  }
}
