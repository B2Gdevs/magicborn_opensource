// lib/roadmaps/index.ts
// Central export for all roadmaps
// Add new roadmaps here to make them available in RoadmapDialog

import { contentEditorRoadmap, currentStatus, nextSteps } from "./content-editor-roadmap";
import { configSettingsRoadmap } from "./config-settings-roadmap";
import { visualPolishRoadmap } from "./visual-polish-roadmap";
import { standardizedMediaUploadRoadmap, standardizedMediaUploadQuestions, standardizedMediaUploadRecommendations } from "./standardized-media-upload-roadmap";
import type { RoadmapData } from "./roadmap-types";

// Register all roadmaps here
export const allRoadmaps: RoadmapData[] = [
  contentEditorRoadmap,
  configSettingsRoadmap,
  visualPolishRoadmap,
  standardizedMediaUploadRoadmap,
];

// Export questions and recommendations for roadmaps
export { standardizedMediaUploadQuestions, standardizedMediaUploadRecommendations };

// Helper to get roadmap by name
export function getRoadmapByName(name: string): RoadmapData | undefined {
  return allRoadmaps.find(roadmap => roadmap.name === name);
}

// Export legacy data for backward compatibility
export { currentStatus, nextSteps };

