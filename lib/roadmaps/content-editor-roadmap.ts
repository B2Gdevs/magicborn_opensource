// lib/roadmaps/content-editor-roadmap.ts
// Content Editor Roadmap - Original roadmap data

import type { RoadmapData } from "./roadmap-types";

export const contentEditorRoadmap: RoadmapData = {
  name: "Content Editor Roadmap",
  description: "Content editor features, writing tools, and AI integration",
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
      title: "Phase 4: Content Editor & Writing Tool",
      priority: "High Priority",
      sections: [
        {
          title: "BlockNote Integration",
          goal: "Implement sophisticated block-based editor for pages",
          items: [
            { text: "Install BlockNote and Vercel AI SDK", completed: true },
            { text: "Replace basic editor with BlockNote in PageEditor", completed: true },
            { text: "Add page numbering system alongside titles", completed: true },
            { text: "Implement BlockNote content persistence", completed: false },
            { text: "Add BlockNote formatting toolbar customization", completed: false },
            { text: "Support for images, code blocks, and advanced formatting", completed: false },
          ],
        },
        {
          title: "AI Integration with BlockNote",
          goal: "Add AI-powered writing assistance using LM Studio",
          items: [
            { text: "Set up Vercel AI SDK with LM Studio backend", completed: false },
            { text: "Create AI API route for text generation/completion", completed: false },
            { text: "Implement AI suggestions within BlockNote editor", completed: false },
            { text: "Add AI-powered content expansion (continue writing)", completed: false },
            { text: "Implement AI-powered editing (rewrite, improve, summarize)", completed: false },
            { text: "Add AI context awareness (character names, plot points)", completed: false },
            { text: "Create AI prompt templates for common writing tasks", completed: false },
          ],
        },
        {
          title: "Detail Toolbar & Views",
          goal: "Organize content editing with tabbed interface",
          items: [
            { text: "Create DetailToolbar component with tabs", completed: true },
            { text: "Integrate toolbar into WriterView", completed: false },
            { text: "Implement Detail tab (Act/Chapter forms, Page editor)", completed: false },
            { text: "Prepare NarrativeThreadView for future Yarn integration", completed: true },
            { text: "Prepare GameThreadView for future Yarn integration", completed: true },
            { text: "Add view state persistence", completed: false },
          ],
        },
        {
          title: "Writing Features",
          goal: "Enhance the writing experience",
          items: [
            { text: "Auto-save functionality", completed: false },
            { text: "Word count and reading time estimates", completed: false },
            { text: "Focus mode (distraction-free writing)", completed: false },
            { text: "Export to various formats (PDF, DOCX, Markdown)", completed: false },
            { text: "Version history and diff view", completed: false },
            { text: "Collaborative editing support", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 5: Advanced Features",
      priority: "Low Priority",
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
};

// Legacy data for backward compatibility
export const currentStatus = [
  "Landing page with hero video and logo",
  "Sidebar navigation with branding",
  "Clean, minimal dark fantasy aesthetic",
  "Video looping working smoothly (no flicker)",
  "About page showcasing all 26 runes (A-Z) with icons and details",
  "Named spells with full information",
  "Spell effects with categories",
  "Discord community link integrated",
];

export const nextSteps = [
  "Add \"About the Game\" section - Show what makes it unique",
  "Create first short story - \"The First Spell\" or similar",
  "Add share buttons - Make stories shareable",
  "Add Discord/Newsletter CTAs - Start building community",
  "Progress tracker - Show development status",
];

