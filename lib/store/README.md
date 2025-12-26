# Zustand Store Convention

## Store Location Rules

### Global/Domain Stores → `lib/store/`
Stores that manage application-wide or domain-level state that may be used across multiple features.

**Examples:**
- `lib/store/gameStore.ts` - Game state (players, spells, evolution)
- `lib/store/spellCraftingStore.ts` - Spell crafting domain logic
- `lib/store/userStore.ts` - User authentication/session state

**When to use:**
- State shared across multiple features/components
- Domain logic that's independent of UI
- Global application state

### Feature/Component Stores → `components/{feature}/store/`
Stores that manage UI state specific to a feature or component tree.

**Examples:**
- `components/content-editor/codex/store/codexSidebar.store.ts` - Codex sidebar UI state
- `components/editor/store/editorState.store.ts` - Editor-specific UI state

**When to use:**
- UI state (expanded/collapsed, modals, selections)
- State scoped to a specific feature
- Component tree state that doesn't need global access

## Component Architecture

### Smart Components (Orchestrators)
- **Location:** Feature root (e.g., `CodexSidebar.tsx`)
- **Responsibilities:**
  - Access Zustand stores
  - Access React Query hooks
  - Coordinate child components
  - Handle business logic
  - Pass data/callbacks to dumb components

### Dumb Components (Presentational)
- **Location:** Feature subdirectories (e.g., `CodexSidebarHeader.tsx`, `CodexCategoryList.tsx`)
- **Responsibilities:**
  - Receive all data via props
  - Receive all callbacks via props
  - Render UI only
  - No direct store access
  - No direct hook access (except UI hooks like `useState` for local UI state)

## Example Pattern

```tsx
// ✅ Smart Component (orchestrator)
export function CodexSidebar() {
  const { isCollapsed, setCollapsed } = useCodexSidebarStore();
  const { data } = useQuery(...);
  
  return (
    <CodexSidebarHeader
      isCollapsed={isCollapsed}
      onToggle={() => setCollapsed(!isCollapsed)}
    />
  );
}

// ✅ Dumb Component (presentational)
export function CodexSidebarHeader({ isCollapsed, onToggle }) {
  return <button onClick={onToggle}>...</button>;
}
```

## Benefits

1. **Testability** - Dumb components are easy to test (just pass props)
2. **Reusability** - Dumb components can be reused with different data sources
3. **Readability** - Clear data flow from smart → dumb
4. **Maintainability** - Changes to state management don't affect presentational components

