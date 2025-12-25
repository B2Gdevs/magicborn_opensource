// lib/roadmaps/config-settings-roadmap.ts
// Config & Settings Refactoring Roadmap
// Modular roadmap data structure for easy updates

export const configSettingsRoadmap = {
  name: "Config & Settings Refactoring",
  description: "Centralize configs, enable admin customization, and improve developer experience",
  phases: [
    {
      title: "Phase 1: ID Generation & Validation",
      priority: "High Priority",
      sections: [
        {
          title: "Remove Name-Based ID Generation",
          goal: "Switch to server-generated unique IDs instead of name-based slugs",
          items: [
            { text: "Remove auto-generation from BasicInfoSection.tsx", completed: true },
            { text: "Remove auto-generation from all form files (8 forms)", completed: true },
            { text: "Remove auto-generation from IdInput.tsx", completed: true },
            { text: "Make slug/spellId/effectType fields optional in Payload collections", completed: true },
            { text: "Update all collections to make ID fields optional", completed: true },
            { text: "Make ID fields read-only in forms (server generates)", completed: true },
          ],
        },
        {
          title: "Server-Side ID Generation",
          goal: "Implement UUID or auto-increment ID generation on server",
          items: [
            { text: "Configure Payload to auto-generate IDs", completed: true },
            { text: "Update API routes to handle server-generated IDs", completed: true },
            { text: "Update form submission to not require ID field", completed: true },
            { text: "Test ID generation across all entry types", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 2: Admin-Configurable Settings",
      priority: "High Priority",
      sections: [
        {
          title: "Projects Collection Updates",
          goal: "Add entry type configs and homepage settings to Projects collection",
          items: [
            { text: "Add entryTypeConfigs JSON field to Projects collection", completed: true },
            { text: "Add homepageConfig group field to Projects collection", completed: true },
            { text: "Update Projects collection schema in Payload", completed: true },
            { text: "Create migration script for existing projects", completed: true },
          ],
        },
        {
          title: "Entry Config Helpers",
          goal: "Update entry-config.tsx to check DB overrides before code defaults",
          items: [
            { text: "Create getDisplayName() helper with projectId support", completed: true },
            { text: "Create useEntryDisplayName() React hook for client-side", completed: true },
            { text: "Update all components to use new helpers", completed: true },
            { text: "Add TypeScript types for entry type configs", completed: true },
          ],
        },
        {
          title: "SiteConfig Project Selection",
          goal: "Allow admins to select which project's content displays on homepage",
          items: [
            { text: "Add activeProject field to SiteConfig global", completed: true },
            { text: "Update homepage to load content from selected project", completed: true },
            { text: "Add project selector in SiteConfig admin UI", completed: true },
            { text: "Handle fallback when project not found", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 3: Settings UI",
      priority: "High Priority",
      sections: [
        {
          title: "Codex Settings Section",
          goal: "Add UI for editing entry type display names per project",
          items: [
            { text: "Add 'Codex Settings' section to settings page navigation", completed: true },
            { text: "Create CodexSettingsEditor component", completed: true },
            { text: "Add form fields for each entry type display name", completed: true },
            { text: "Implement save/load functionality", completed: true },
            { text: "Add validation and error handling", completed: true },
          ],
        },
        {
          title: "Homepage Settings Section",
          goal: "Add UI for editing project-specific homepage content",
          items: [
            { text: "Add 'Homepage Settings' section to settings page", completed: true },
            { text: "Create HomepageSettingsEditor component", completed: true },
            { text: "Add hero content editor (similar to global SiteConfig)", completed: true },
            { text: "Add hero video selector", completed: true },
            { text: "Implement save/load functionality", completed: true },
          ],
        },
      ],
    },
    {
      title: "Phase 4: Developer Experience",
      priority: "Medium Priority",
      sections: [
        {
          title: "Documentation & Guidelines",
          goal: "Document the code defaults + DB overrides pattern",
          items: [
            { text: "Update CONFIG_PATTERN_GUIDE.md with new pattern", completed: false },
            { text: "Add developer guidelines for using entry configs", completed: false },
            { text: "Document database vs UI naming conventions", completed: false },
            { text: "Add examples of when to use code vs DB configs", completed: false },
          ],
        },
        {
          title: "Type Safety",
          goal: "Ensure type safety across config system",
          items: [
            { text: "Add TypeScript types for all config structures", completed: false },
            { text: "Create type guards for config validation", completed: false },
            { text: "Add runtime validation for admin configs", completed: false },
          ],
        },
      ],
    },
    {
      title: "Phase 5: Additional Cleanup",
      priority: "Low Priority",
      sections: [
        {
          title: "Form Section Configs",
          goal: "Centralize form section definitions (future enhancement)",
          items: [
            { text: "Create form-section-config.tsx", completed: false },
            { text: "Migrate all forms to use centralized configs", completed: false },
            { text: "Make form sections admin-configurable (future)", completed: false },
          ],
        },
        {
          title: "Status Type Configs",
          goal: "Centralize status types with icons/colors (future enhancement)",
          items: [
            { text: "Create status-config.tsx", completed: false },
            { text: "Update all components to use status configs", completed: false },
            { text: "Make status types admin-configurable (future)", completed: false },
          ],
        },
      ],
    },
  ],
};

