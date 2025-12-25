// lib/roadmaps/visual-polish-roadmap.ts
// Visual Polish Roadmap
// Subtle, Photoshop-like polish - powerful engine feel

export const visualPolishRoadmap = {
  name: "Visual Polish",
  description: "Subtle, Photoshop-like polish - powerful engine feel, not over-animated or under-animated. Professional and refined.",
  phases: [
    {
      title: "Phase 1: Core Polish (Must Have)",
      priority: "High Priority",
      sections: [
        {
          title: "Toast Notification System",
          goal: "Replace browser alerts with subtle shadcn-style toast notifications using sonner library",
          items: [
            { text: "Install sonner library (npm install sonner)", completed: true },
            { text: "Create components/ui/Toaster.tsx with custom styling", completed: true },
            { text: "Create lib/hooks/useToast.ts wrapper hook", completed: true },
            { text: "Style toasts to match shadcn card style (bg-shadow, border-border)", completed: true },
            { text: "Add color-coded top borders (green/red/amber/blue)", completed: true },
            { text: "Use faded grey text (text-text-secondary)", completed: true },
            { text: "Add appropriate icons (CheckCircle, XCircle, AlertCircle, Info from lucide-react)", completed: true },
            { text: "Replace alerts in NewEntryMenu.tsx", completed: true },
            { text: "Replace alerts in CharacterForm.tsx (3 alerts)", completed: true },
            { text: "Replace alerts in remaining form components (14 files)", completed: true },
          ],
        },
        {
          title: "Skeleton Loaders with Shimmer",
          goal: "Replace spinner-only loading with skeleton placeholders that match actual content layout",
          items: [
            { text: "Create components/ui/Skeleton.tsx reusable component", completed: true },
            { text: "Add subtle shimmer animation to globals.css (2s, very light)", completed: true },
            { text: "Add skeleton loaders to CodexSidebar loading states", completed: true },
            { text: "Use getEntryConfig() to get icons for skeleton (respects config system)", completed: true },
            { text: "Update PageEditor to use skeleton loaders", completed: true },
            { text: "Update app/content-editor/[projectId]/page.tsx to use skeleton", completed: true },
            { text: "Ensure skeleton matches actual card layout structure", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 2: Subtle Enhancements (Nice to Have)",
      priority: "Medium Priority",
      sections: [
        {
          title: "Button Press Feedback",
          goal: "Add very subtle active state animation to buttons",
          items: [
            { text: "Add active:scale-[0.98] to Button component (not 0.95 - too obvious)", completed: true },
            { text: "Keep existing transition-all for smooth animation", completed: true },
          ],
        },
        {
          title: "Card Hover Subtlety",
          goal: "Enhance card hover with subtle shadow (no movement)",
          items: [
            { text: "Add hover:shadow-sm to card components throughout app", completed: true },
            { text: "Change transition-colors to transition-all duration-200", completed: true },
            { text: "NO translate - too obvious, keep it subtle", completed: true },
          ],
        },
        {
          title: "Form Field Focus Glow",
          goal: "Add subtle ember glow on form field focus",
          items: [
            { text: "Add global CSS for input:focus, textarea:focus, select:focus", completed: true },
            { text: "Add subtle box-shadow with ember color (rgba(139, 69, 19, 0.3))", completed: true },
            { text: "Update border-color to ember-glow on focus", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 3: Config System Integration",
      priority: "High Priority",
      sections: [
        {
          title: "Respect Config-Driven Icons",
          goal: "Ensure all visual components use entry-config.tsx helpers, never hardcode icons",
          items: [
            { text: "Document icon usage: Entry Config icons vs Toast icons (two different systems)", completed: true },
            { text: "Verify skeleton loaders use getEntryConfig().icon", completed: true },
            { text: "Verify content cards use getEntryConfig().icon", completed: true },
            { text: "Verify toast notifications use lucide-react icons directly (not entry config)", completed: true },
            { text: "Add code comments explaining when to use each icon system", completed: true },
            { text: "Add graceful defaults for missing icons (Settings page, etc.)", completed: true },
            { text: "Create ICON_USAGE_GUIDE.md documentation", completed: true },
          ],
        },
      ],
    },
  ],
};

