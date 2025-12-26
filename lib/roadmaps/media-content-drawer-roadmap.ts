// lib/roadmaps/standardized-media-upload-roadmap.ts
// Standardized Media Upload Roadmap
// Create a unified, reusable media upload component system with consistent look and functionality across the entire app

import type { RoadmapData } from "./roadmap-types";

export const standardizedMediaUploadRoadmap: RoadmapData = {
  name: "Standardized Media Upload",
  description: "Create a unified, reusable media upload component system with consistent hover interactions, drag-and-drop, media library search popup, and flexible sizing (thumbnail, full image, inline) - used everywhere in the app",
  phases: [
    {
      title: "Phase 1: Extract & Standardize Core Component",
      priority: "High Priority",
      sections: [
        {
          title: "Extract Media Popup into Reusable Component",
          goal: "Create a shared MediaLibraryPopup component from ActDetailView/ChapterDetailView pattern",
          items: [
            { text: "Create components/ui/MediaLibraryPopup.tsx with the popup modal UI", completed: false },
            { text: "Extract media library fetching logic into reusable hook (useMediaLibrary)", completed: false },
            { text: "Extract media search and filtering logic", completed: false },
            { text: "Extract preview/confirm selection pattern", completed: false },
            { text: "Make popup accept props: onSelect, onUpload, currentMediaId, mediaType filter", completed: false },
            { text: "Ensure popup works for images only (filter by MIME type)", completed: false },
          ],
        },
        {
          title: "Create StandardMediaUpload Component",
          goal: "Build the main reusable component that combines display + popup",
          items: [
            { text: "Create components/ui/StandardMediaUpload.tsx as the main component", completed: false },
            { text: "Support size variants: 'thumbnail' (small), 'full' (large), 'inline' (next to elements)", completed: false },
            { text: "Implement hover interactions (show overlay with buttons on hover)", completed: false },
            { text: "Add drag-and-drop support (visual feedback, drop handling)", completed: false },
            { text: "Integrate MediaLibraryPopup (opens on click when image exists)", completed: false },
            { text: "Add click-to-upload when no image (opens file picker or popup)", completed: false },
            { text: "Support currentMediaId and currentMediaUrl props", completed: false },
            { text: "Add onMediaSelected callback (returns mediaId)", completed: false },
            { text: "Add onMediaRemoved callback", completed: false },
            { text: "Ensure consistent styling across all size variants", completed: false },
          ],
        },
        {
          title: "Component API & Props Design",
          goal: "Define clean, flexible API for all use cases",
          items: [
            { text: "Define StandardMediaUploadProps interface with all options", completed: false },
            { text: "Add size prop: 'thumbnail' | 'full' | 'inline' (default: 'full')", completed: false },
            { text: "Add mediaType prop: 'image' | 'video' | 'audio' | 'all' (default: 'image')", completed: false },
            { text: "Add disabled prop for read-only states", completed: false },
            { text: "Add label prop (optional, for form contexts)", completed: false },
            { text: "Add className prop for custom styling", completed: false },
            { text: "Add showLibraryButton prop (default: true)", completed: false },
            { text: "Add showUploadButton prop (default: true)", completed: false },
            { text: "Add showRemoveButton prop (default: true)", completed: false },
            { text: "Document all props with JSDoc comments", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 2: Replace Existing Implementations",
      priority: "High Priority",
      sections: [
        {
          title: "Replace ActDetailView & ChapterDetailView",
          goal: "Use StandardMediaUpload in content editor detail views",
          items: [
            { text: "Replace ActDetailView image upload with StandardMediaUpload", completed: false },
            { text: "Replace ChapterDetailView image upload with StandardMediaUpload", completed: false },
            { text: "Remove duplicate media popup code from both components", completed: false },
            { text: "Remove duplicate media library fetching logic", completed: false },
            { text: "Test hover, drag-drop, and popup functionality", completed: false },
            { text: "Ensure autosave still works correctly", completed: false },
          ],
        },
        {
          title: "Replace Form Components",
          goal: "Update all entity forms to use StandardMediaUpload",
          items: [
            { text: "Update BasicInfoSection to use StandardMediaUpload", completed: false },
            { text: "Replace MediaUpload component usage in CharacterForm", completed: false },
            { text: "Replace MediaUpload component usage in CreatureForm", completed: false },
            { text: "Replace MediaUpload component usage in RegionForm", completed: false },
            { text: "Replace MediaUpload component usage in ObjectForm", completed: false },
            { text: "Replace MediaUpload component usage in LoreForm", completed: false },
            { text: "Replace MediaUpload component usage in RuneForm", completed: false },
            { text: "Replace MediaUpload component usage in EffectForm", completed: false },
            { text: "Update all forms to use consistent size variants", completed: false },
            { text: "Test all forms with new component", completed: false },
          ],
        },
        {
          title: "Replace Other Media Upload Components",
          goal: "Consolidate all media upload patterns",
          items: [
            { text: "Audit all uses of ImageUpload component", completed: false },
            { text: "Replace ImageUpload with StandardMediaUpload where appropriate", completed: false },
            { text: "Update any custom media upload implementations", completed: false },
            { text: "Ensure all media uploads use Payload CMS media collection", completed: false },
            { text: "Verify all uploads filter to correct media types (images only for image fields)", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 3: Enhance Functionality",
      priority: "Medium Priority",
      sections: [
        {
          title: "Drag & Drop Improvements",
          goal: "Make drag-and-drop work seamlessly everywhere",
          items: [
            { text: "Add visual drag overlay when dragging files over component", completed: false },
            { text: "Support dragging from media library popup to other components", completed: false },
            { text: "Add drag preview (thumbnail + filename)", completed: false },
            { text: "Handle multi-file drag (select first valid file)", completed: false },
            { text: "Add drag-and-drop to empty state (no image selected)", completed: false },
            { text: "Add drag-and-drop to existing image (replace on drop)", completed: false },
          ],
        },
        {
          title: "Media Library Popup Enhancements",
          goal: "Improve the media library search and selection experience",
          items: [
            { text: "Add keyboard navigation (arrow keys, enter to select, escape to close)", completed: false },
            { text: "Add recent media section (last 10 uploaded)", completed: false },
            { text: "Add media type filter tabs (All, Images, Videos, Audio)", completed: false },
            { text: "Add sort options (Date, Name, Size) in popup", completed: false },
            { text: "Add pagination or infinite scroll for large libraries", completed: false },
            { text: "Add media preview on hover in grid (larger thumbnail)", completed: false },
            { text: "Add upload progress indicator when uploading from popup", completed: false },
            { text: "Auto-refresh library after upload", completed: false },
          ],
        },
        {
          title: "Size Variant Refinements",
          goal: "Perfect each size variant for its use case",
          items: [
            { text: "Thumbnail: Optimize for small spaces (toolbars, lists, cards)", completed: false },
            { text: "Full: Optimize for main image displays (forms, detail views)", completed: false },
            { text: "Inline: Optimize for side-by-side with other form fields", completed: false },
            { text: "Ensure hover states work well in all sizes", completed: false },
            { text: "Ensure drag-and-drop works in all sizes", completed: false },
            { text: "Add responsive behavior (thumbnail on mobile, full on desktop)", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 4: Consistency & Polish",
      priority: "Medium Priority",
      sections: [
        {
          title: "Visual Consistency",
          goal: "Ensure identical look and feel everywhere",
          items: [
            { text: "Audit all media upload instances for visual consistency", completed: false },
            { text: "Standardize hover overlay styles across all variants", completed: false },
            { text: "Standardize button styles (Library, Upload, Remove)", completed: false },
            { text: "Standardize empty state design (no image selected)", completed: false },
            { text: "Standardize loading states (uploading, fetching library)", completed: false },
            { text: "Standardize error states (upload failed, invalid file)", completed: false },
            { text: "Ensure consistent spacing and sizing", completed: false },
          ],
        },
        {
          title: "Behavioral Consistency",
          goal: "Ensure identical interactions everywhere",
          items: [
            { text: "All uploads should open same media library popup", completed: false },
            { text: "All uploads should support drag-and-drop the same way", completed: false },
            { text: "All uploads should show same hover interactions", completed: false },
            { text: "All uploads should handle errors the same way", completed: false },
            { text: "All uploads should validate file types consistently", completed: false },
            { text: "All uploads should use same Payload CMS media collection", completed: false },
            { text: "Document expected behavior in component README", completed: false },
          ],
        },
        {
          title: "Performance & Optimization",
          goal: "Ensure component performs well everywhere",
          items: [
            { text: "Optimize media library fetching (cache, debounce search)", completed: false },
            { text: "Lazy load media library popup (only fetch when opened)", completed: false },
            { text: "Optimize image previews (use thumbnails where possible)", completed: false },
            { text: "Add loading skeletons instead of spinners", completed: false },
            { text: "Implement virtual scrolling for large media grids", completed: false },
            { text: "Add error boundaries for media upload failures", completed: false },
          ],
        },
      ],
    },
  ],
};

// Questions & Recommendations
export const standardizedMediaUploadQuestions = [
  {
    question: "Component Naming: What should we call it?",
    options: [
      "StandardMediaUpload - clear, descriptive",
      "MediaPicker - shorter, action-focused",
      "UnifiedMediaUpload - emphasizes consistency",
      "MediaField - form-focused naming",
    ],
    recommendation: "StandardMediaUpload - most descriptive and clear about purpose",
  },
  {
    question: "Size Variants: How many do we need?",
    options: [
      "Three: thumbnail, full, inline (recommended)",
      "Two: small, large (simpler)",
      "Four+: thumbnail, small, medium, large, inline (more flexible)",
      "Single size with className override (most flexible)",
    ],
    recommendation: "Three variants (thumbnail, full, inline) - covers all use cases without complexity",
  },
  {
    question: "Media Library Popup: Separate Component or Embedded?",
    options: [
      "Separate component (MediaLibraryPopup) - reusable, cleaner",
      "Embedded in StandardMediaUpload - simpler, less flexible",
      "Context/hook-based - most flexible, but more complex",
    ],
    recommendation: "Separate component - allows reuse in other contexts, cleaner code",
  },
  {
    question: "File Upload: Immediate or Deferred?",
    options: [
      "Immediate upload on file select (current pattern) - simpler, consistent",
      "Deferred upload (on form submit) - more control, more complex",
      "Hybrid: immediate for preview, deferred for final save",
    ],
    recommendation: "Immediate upload - matches current pattern, simpler UX, media available immediately",
  },
  {
    question: "Media Type Filtering: How Strict?",
    options: [
      "Strict: image fields only show images, video fields only show videos",
      "Flexible: show all media, filter by preference",
      "Configurable: prop to control strictness",
    ],
    recommendation: "Strict filtering - prevents errors, clearer UX, matches user expectations",
  },
  {
    question: "Existing Components: Replace or Deprecate?",
    options: [
      "Replace immediately - clean break, consistent codebase",
      "Deprecate gradually - less disruption, more migration work",
      "Keep both - most flexible, but inconsistent",
    ],
    recommendation: "Replace immediately - ensures consistency, cleaner codebase, one pattern to maintain",
  },
];

// Technical Recommendations
export const standardizedMediaUploadRecommendations = [
  {
    category: "Component Architecture",
    recommendations: [
      "Use compound component pattern: StandardMediaUpload + MediaLibraryPopup",
      "Create useMediaLibrary hook for shared media fetching logic",
      "Use React Context for media library state if needed across multiple instances",
      "Keep component props minimal - use sensible defaults",
      "Export types/interfaces for TypeScript support",
    ],
  },
  {
    category: "State Management",
    recommendations: [
      "Manage popup open/closed state internally (useState)",
      "Fetch media library only when popup opens (lazy loading)",
      "Cache media library results (useMemo or external cache)",
      "Debounce search input (300ms delay)",
      "Handle loading and error states gracefully",
    ],
  },
  {
    category: "User Experience",
    recommendations: [
      "Show upload progress when dragging files",
      "Provide immediate visual feedback on hover",
      "Use consistent button labels (Library, Upload, Remove)",
      "Show helpful error messages for invalid files",
      "Support keyboard navigation in popup",
      "Add tooltips for button actions",
    ],
  },
  {
    category: "Performance",
    recommendations: [
      "Lazy load media library popup component",
      "Use image thumbnails in library grid (not full images)",
      "Implement virtual scrolling for large media lists",
      "Cache media library API responses",
      "Debounce search to reduce API calls",
      "Use React.memo for component optimization",
    ],
  },
  {
    category: "Accessibility",
    recommendations: [
      "Add ARIA labels for all interactive elements",
      "Support keyboard navigation (Tab, Enter, Escape)",
      "Add focus management when popup opens/closes",
      "Ensure drag-and-drop works with screen readers",
      "Add alt text for all media previews",
    ],
  },
];
