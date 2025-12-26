// components/content-editor/RoadmapDialog.tsx
// Roadmap and quick guide dialog with sidebar navigation
// Modular roadmap system - add new roadmaps in lib/roadmaps/

"use client";

import { useState } from "react";
import { X, BookOpen, Map, CheckCircle2, Circle, Loader2, AlertTriangle, Bug, Code, TestTube, HelpCircle, Lightbulb } from "lucide-react";
import { SidebarNav, type SidebarNavItem } from "@components/ui/SidebarNav";
import { allRoadmaps, currentStatus, nextSteps, getRoadmapByName, standardizedMediaUploadQuestions, standardizedMediaUploadRecommendations } from "@/lib/roadmaps";
import type { RoadmapData } from "@/lib/roadmaps/roadmap-types";

interface RoadmapDialogProps {
  onClose: () => void;
}

type Section = "quick-guide" | "roadmap" | "issues";

// Legacy roadmap data structure (kept for backward compatibility with quick-guide)
const legacyRoadmapData = {
  currentStatus,
  nextSteps,
};

export function RoadmapDialog({ onClose }: RoadmapDialogProps) {
  const [activeSection, setActiveSection] = useState<Section>("quick-guide");
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapData | null>(
    allRoadmaps[0] || null
  );

  const navigationItems = [
    { id: "quick-guide" as Section, label: "Quick Guide", icon: BookOpen },
    { id: "roadmap" as Section, label: "Roadmap", icon: Map },
    { id: "issues" as Section, label: "Issues & Bugs", icon: AlertTriangle },
  ];

  interface Issue {
    title: string;
    description: string;
    priority: string;
    category: string;
    file: string;
    completed?: boolean;
  }

  const issuesData: {
    critical: Issue[];
    high: Issue[];
    medium: Issue[];
    low: Issue[];
  } = {
    critical: [
      // No critical issues currently - all resolved!
    ],
    high: [
      {
        title: "Content Editor Tabs Not Functional",
        description: "Plan, Write, Chat, Review tabs are not implemented - only Plan tab exists",
        priority: "High",
        category: "Feature",
        file: "components/content-editor/ContentEditor.tsx",
      },
      {
        title: "Codex Entries Not Showing in Grid",
        description: "Codex entries don't show in grid view yet - API integration pending",
        priority: "High",
        category: "Feature",
        file: "components/content-editor/ContentGridView.tsx",
      },
    ],
    medium: [
      {
        title: "Error Handling Missing User Feedback",
        description: "Many console.error calls without user-facing error handling or error boundaries",
        priority: "Medium",
        category: "UX",
        file: "Multiple files",
      },
      {
        title: "Build Type Errors",
        description: "Fixed CollectionSlug and GlobalSlug type errors in payload API route",
        priority: "Medium",
        category: "Bug Fix",
        file: "app/api/payload/[...slug]/route.ts",
        completed: true,
      },
      {
        title: "LM Studio Catalog Improvements",
        description: "Future improvements needed for model catalog API",
        priority: "Medium",
        category: "Enhancement",
        file: "app/api/ai-stack/lmstudio/models/catalog/route.ts",
      },
    ],
    low: [
      {
        title: "Next.js 14 vs Payload 3.x Mismatch",
        description: "Using --legacy-peer-deps due to version mismatch - consider upgrading to Next.js 15",
        priority: "Low",
        category: "Technical Debt",
        file: "package.json",
      },
      {
        title: "Outdated Code Files",
        description: "OUTDATED_CODE.md lists files that need cleanup",
        priority: "Low",
        category: "Technical Debt",
        file: "OUTDATED_CODE.md",
      },
      {
        title: "Missing Test Coverage",
        description: "Many components lack test coverage - only 13 test files found",
        priority: "Low",
        category: "Quality",
        file: "lib/__tests__/",
      },
    ],
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "quick-guide":
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">Getting Started</h3>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                <div className="p-4 bg-deep/50 border border-border rounded-lg">
                  <h4 className="font-semibold text-text-primary mb-2">Welcome to Magicborn Content Editor</h4>
                  <p className="text-sm text-text-secondary mb-4">
                    The Content Editor is your workspace for creating and managing your project's content. 
                    Here's a quick guide to help you get started.
                  </p>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow mt-1">•</span>
                      <span><strong className="text-text-primary">Plan Tab:</strong> Organize your content structure with Acts, Chapters, and Scenes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow mt-1">•</span>
                      <span><strong className="text-text-primary">Grid View:</strong> Visual overview of your content hierarchy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow mt-1">•</span>
                      <span><strong className="text-text-primary">Search:</strong> Quickly find content using the search bar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow mt-1">•</span>
                      <span><strong className="text-text-primary">Versions:</strong> Track and restore previous versions of your content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-ember-glow mt-1">•</span>
                      <span><strong className="text-text-primary">Settings:</strong> Configure project settings and AI stack services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">Current Status</h3>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-2">
                {legacyRoadmapData.currentStatus.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-deep/30 rounded">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1 text-text-primary">Immediate Next Steps</h3>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-2">
                {legacyRoadmapData.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-deep/30 rounded">
                    <Circle className="w-4 h-4 text-ember-glow mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "roadmap":
        if (!selectedRoadmap) {
          return (
            <div className="p-8 text-center text-text-muted">
              <p>No roadmap selected</p>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            {/* Roadmap Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-glow mb-2">{selectedRoadmap.name}</h3>
              <p className="text-sm text-text-secondary">{selectedRoadmap.description}</p>
            </div>
            
            {selectedRoadmap.phases.map((phase, phaseIndex) => (
              <div key={phaseIndex}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">{phase.title}</h3>
                  <span className="px-2 py-1 text-xs bg-ember/20 text-ember-glow rounded border border-ember/30">
                    {phase.priority}
                  </span>
                </div>
                <div className="h-px bg-border mb-6" />
                <div className="space-y-6">
                  {phase.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="p-4 bg-deep/50 border border-border rounded-lg">
                      <h4 className="font-semibold text-text-primary mb-1">{section.title}</h4>
                      <p className="text-xs text-text-muted mb-4">{section.goal}</p>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-2">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${item.completed ? "text-text-secondary line-through" : "text-text-secondary"}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Questions & Recommendations - Only show for Standardized Media Upload roadmap */}
            {selectedRoadmap.name === "Standardized Media Upload" && (
              <>
                {/* Questions Section */}
                {standardizedMediaUploadQuestions && standardizedMediaUploadQuestions.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <HelpCircle className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-text-primary">Questions & Options</h3>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                        Discussion Needed
                      </span>
                    </div>
                    <div className="h-px bg-border mb-6" />
                    <div className="space-y-6">
                      {standardizedMediaUploadQuestions.map((q, index) => (
                        <div key={index} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-blue-400" />
                            {q.question}
                          </h4>
                          <div className="space-y-2 mb-3">
                            {q.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-start gap-2 pl-4">
                                <span className="text-blue-400 mt-1">•</span>
                                <span className="text-sm text-text-secondary">{option}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-blue-500/20">
                            <p className="text-xs text-blue-300 flex items-start gap-2">
                              <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span><strong className="text-blue-200">Recommendation:</strong> {q.recommendation}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations Section */}
                {standardizedMediaUploadRecommendations && standardizedMediaUploadRecommendations.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-text-primary">Technical Recommendations</h3>
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                        Best Practices
                      </span>
                    </div>
                    <div className="h-px bg-border mb-6" />
                    <div className="space-y-6">
                      {standardizedMediaUploadRecommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                          <h4 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            {rec.category}
                          </h4>
                          <div className="space-y-2">
                            {rec.recommendations.map((recommendation, recIndex) => (
                              <div key={recIndex} className="flex items-start gap-2 pl-4">
                                <span className="text-yellow-400 mt-1">•</span>
                                <span className="text-sm text-text-secondary">{recommendation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "issues":
        return (
          <div className="space-y-8">
            {/* Critical Issues */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-text-primary">Critical Issues</h3>
                <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded border border-red-500/30">
                  Fix Immediately
                </span>
              </div>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                {issuesData.critical.length > 0 ? (
                  issuesData.critical.map((issue, index) => (
                    <div key={index} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-text-primary">{issue.title}</h4>
                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                          {issue.category}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{issue.description}</p>
                      <p className="text-xs text-text-muted">File: {issue.file}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-text-secondary">
                      ✅ No critical issues! All critical bugs have been resolved.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* High Priority Issues */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Bug className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-text-primary">High Priority</h3>
                <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded border border-orange-500/30">
                  Fix Soon
                </span>
              </div>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                {issuesData.high.map((issue, index) => (
                  <div key={index} className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-text-primary">{issue.title}</h4>
                      <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{issue.description}</p>
                    <p className="text-xs text-text-muted">File: {issue.file}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Priority Issues */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Code className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-text-primary">Medium Priority</h3>
                <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">
                  Plan For
                </span>
              </div>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                {issuesData.medium.map((issue, index) => (
                  <div key={index} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-text-primary">{issue.title}</h4>
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{issue.description}</p>
                    <p className="text-xs text-text-muted">File: {issue.file}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Priority Issues */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <TestTube className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-text-primary">Low Priority</h3>
                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                  Technical Debt
                </span>
              </div>
              <div className="h-px bg-border mb-6" />
              <div className="space-y-4">
                {issuesData.low.map((issue, index) => (
                  <div key={index} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-text-primary">{issue.title}</h4>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{issue.description}</p>
                    <p className="text-xs text-text-muted">File: {issue.file}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-void border border-border rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-shadow px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-bold text-glow">Roadmap & Guide</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-deep rounded-lg transition-colors text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <SidebarNav
            items={navigationItems.map((item) => ({
              id: item.id,
              label: item.label,
              icon: item.icon,
            }))}
            activeId={activeSection}
            onItemClick={(id) => setActiveSection(id as Section)}
            width="md"
            sticky={false}
            renderExtra={(activeId) =>
              activeId === "roadmap" && allRoadmaps.length > 1 ? (
                <>
                  <div className="h-px bg-border my-4" />
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted px-3 py-1 font-semibold uppercase tracking-wider">
                      Select Roadmap
                    </p>
                    {allRoadmaps.map((roadmap) => (
                      <button
                        key={roadmap.name}
                        onClick={() => setSelectedRoadmap(roadmap)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          selectedRoadmap?.name === roadmap.name
                            ? "bg-ember/20 text-ember-glow border border-ember/30"
                            : "text-text-muted hover:text-text-primary hover:bg-deep/50"
                        }`}
                      >
                        <Map className="w-4 h-4" />
                        <span className="text-sm font-medium">{roadmap.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : null
            }
          />

          {/* Content Panel */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-glow mb-2">
                  {navigationItems.find((item) => item.id === activeSection)?.label}
                </h2>
                <div className="h-px bg-border" />
              </div>

              <div className="space-y-8">
                {renderSectionContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

