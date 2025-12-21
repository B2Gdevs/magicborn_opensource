// components/content-editor/RoadmapDialog.tsx
// Roadmap and quick guide dialog with sidebar navigation

"use client";

import { useState } from "react";
import { X, BookOpen, Map, CheckCircle2, Circle, Loader2, AlertTriangle, Bug, Code, TestTube } from "lucide-react";

interface RoadmapDialogProps {
  onClose: () => void;
}

type Section = "quick-guide" | "roadmap" | "issues";

const roadmapData = {
  currentStatus: [
    "Landing page with hero video and logo",
    "Sidebar navigation with branding",
    "Clean, minimal dark fantasy aesthetic",
    "Video looping working smoothly (no flicker)",
    "About page showcasing all 26 runes (A-Z) with icons and details",
    "Named spells with full information",
    "Spell effects with categories",
    "Discord community link integrated",
  ],
  phases: [
    {
      title: "Phase 1: Foundation & Engagement",
      priority: "Priority",
      sections: [
        {
          title: "Game Overview Section",
          goal: "Show what the game is like",
          items: [
            { text: "About page created", completed: true },
            { text: "Runes showcase with icons and details", completed: true },
            { text: "Named spells display", completed: true },
            { text: "Spell effects showcase", completed: true },
            { text: "Visual showcase with screenshots/gifs", completed: false },
            { text: "What makes it unique (expand descriptions)", completed: false },
          ],
        },
        {
          title: "Progress Tracker",
          goal: "Show development progress transparently",
          items: [
            { text: "Development status dashboard", completed: false },
            { text: "Feature completion tracker", completed: false },
            { text: "Roadmap timeline", completed: false },
            { text: "\"What's Next\" section", completed: false },
            { text: "Link to GitHub for transparency", completed: false },
          ],
        },
        {
          title: "Goals & Vision",
          goal: "Share our vision and goals",
          items: [
            { text: "Mission statement", completed: false },
            { text: "Development goals", completed: false },
            { text: "Community goals", completed: false },
            { text: "Long-term vision", completed: false },
          ],
        },
        {
          title: "Short Stories Section",
          goal: "Build lore and engagement",
          items: [
            { text: "Stories page with reading interface", completed: false },
            { text: "First story: \"The First Spell\" or similar", completed: false },
            { text: "Story categories/tags", completed: false },
            { text: "Share buttons on each story", completed: false },
            { text: "Reading time estimates", completed: false },
            { text: "Story preview cards", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 2: Social & Sharing",
      priority: "High Priority",
      sections: [
        {
          title: "Share Functionality",
          goal: "Make it easy to share",
          items: [
            { text: "Social share buttons (Twitter, Reddit, Discord)", completed: false },
            { text: "Shareable story cards with images", completed: false },
            { text: "Open Graph meta tags", completed: false },
            { text: "Twitter card optimization", completed: false },
            { text: "Copy link functionality", completed: false },
          ],
        },
        {
          title: "Community Building",
          goal: "Build a community",
          items: [
            { text: "Discord invite link (prominent)", completed: true },
            { text: "\"Join the Community\" CTA on About page", completed: true },
            { text: "Newsletter signup", completed: false },
            { text: "Email collection for updates", completed: false },
            { text: "Community showcase (fan art, discussions)", completed: false },
          ],
        },
        {
          title: "Rewards & Incentives",
          goal: "Make sharing rewarding",
          items: [
            { text: "Early access signup", completed: false },
            { text: "Beta tester recruitment", completed: false },
            { text: "Community contributor recognition", completed: false },
            { text: "Referral system (if applicable)", completed: false },
            { text: "Exclusive content for subscribers", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 3: Content & SEO",
      priority: "Medium Priority",
      sections: [
        {
          title: "Blog/News Section",
          goal: "Regular updates and SEO",
          items: [
            { text: "Dev blog posts", completed: false },
            { text: "Update posts", completed: false },
            { text: "Behind-the-scenes content", completed: false },
            { text: "SEO-optimized articles", completed: false },
            { text: "RSS feed", completed: false },
          ],
        },
        {
          title: "FAQ Page",
          goal: "Answer common questions",
          items: [
            { text: "Game mechanics FAQ", completed: false },
            { text: "Development FAQ", completed: false },
            { text: "Community FAQ", completed: false },
            { text: "SEO-friendly Q&A format", completed: false },
          ],
        },
        {
          title: "Media Kit",
          goal: "Make it easy for press/creators",
          items: [
            { text: "Press kit download", completed: false },
            { text: "Screenshots/gifs", completed: false },
            { text: "Logo assets", completed: false },
            { text: "Brand guidelines", completed: false },
            { text: "Contact for press", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 4: Advanced Features",
      priority: "Lower Priority",
      sections: [
        {
          title: "Interactive Elements",
          goal: "Engage users with interactive content",
          items: [
            { text: "Spell crafting demo/interactive", completed: false },
            { text: "Rune explorer", completed: false },
            { text: "Character creator preview", completed: false },
            { text: "Mini-games or demos", completed: false },
          ],
        },
        {
          title: "Analytics & Tracking",
          goal: "Measure and optimize",
          items: [
            { text: "Google Analytics", completed: false },
            { text: "Social sharing tracking", completed: false },
            { text: "User engagement metrics", completed: false },
            { text: "A/B testing setup", completed: false },
          ],
        },
        {
          title: "Performance Optimization",
          goal: "Improve site performance",
          items: [
            { text: "Image optimization", completed: false },
            { text: "Video optimization", completed: false },
            { text: "Lazy loading", completed: false },
            { text: "CDN setup", completed: false },
            { text: "Caching strategy", completed: false },
          ],
        },
      ],
    },
  ],
  nextSteps: [
    "Add \"About the Game\" section - Show what makes it unique",
    "Create first short story - \"The First Spell\" or similar",
    "Add share buttons - Make stories shareable",
    "Add Discord/Newsletter CTAs - Start building community",
    "Progress tracker - Show development status",
  ],
};

export function RoadmapDialog({ onClose }: RoadmapDialogProps) {
  const [activeSection, setActiveSection] = useState<Section>("quick-guide");

  const navigationItems = [
    { id: "quick-guide" as Section, label: "Quick Guide", icon: BookOpen },
    { id: "roadmap" as Section, label: "Roadmap", icon: Map },
    { id: "issues" as Section, label: "Issues & Bugs", icon: AlertTriangle },
  ];

  const issuesData = {
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
                {roadmapData.currentStatus.map((item, index) => (
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
                {roadmapData.nextSteps.map((step, index) => (
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
        return (
          <div className="space-y-8">
            {roadmapData.phases.map((phase, phaseIndex) => (
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
          <aside className="w-64 border-r border-border bg-shadow flex-shrink-0">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-deep text-ember-glow"
                        : "text-text-muted hover:text-text-primary hover:bg-deep/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

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

