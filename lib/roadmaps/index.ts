// lib/roadmaps/index.ts
// Central export for all roadmaps
// Add new roadmaps here to make them available in RoadmapDialog

import type { RoadmapData } from "./roadmap-types";

// Register all roadmaps here
export const allRoadmaps: RoadmapData[] = [
];

// Helper to get roadmap by name
export function getRoadmapByName(name: string): RoadmapData | undefined {
  return allRoadmaps.find(roadmap => roadmap.name === name);
}

