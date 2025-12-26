// lib/roadmaps/roadmap-types.ts
// Shared types for modular roadmap system

export interface RoadmapItem {
  text: string;
  completed: boolean;
}

export interface RoadmapSection {
  title: string;
  goal: string;
  items: RoadmapItem[];
}

export interface RoadmapPhase {
  title: string;
  priority: "High Priority" | "Medium Priority" | "Low Priority" | "Priority";
  sections: RoadmapSection[];
}

export interface RoadmapData {
  name: string;
  description: string;
  phases: RoadmapPhase[];
}

export type RoadmapPriority = "High Priority" | "Medium Priority" | "Low Priority" | "Priority";


