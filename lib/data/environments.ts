// lib/data/environments.ts
// Environment definitions - top-level locations/regions

/**
 * Environment definition - a top-level location/region in the game world
 * (e.g., "Tarro", "Beanstalk Stump", "Wildlands")
 */
export interface EnvironmentDefinition {
  id: string;
  name: string;
  description: string;
  imagePath?: string; // Path to image in public/game-content/environments/
  storyIds: string[]; // Array of story file names (like characters/creatures)
  mapIds: string[]; // Array of map IDs within this environment
  metadata: {
    biome: string;
    climate: string;
    dangerLevel: number;
  };
}


