# Icon Usage Guide

## Two Icon Systems

The codebase uses **two separate icon systems** for different purposes. Understanding when to use each is important for consistency and maintainability.

---

## 1. Entry Config Icons (Content Types)

**Location:** `lib/content-editor/entry-config.tsx`

**Purpose:** Icons for content types (Character, Spell, Region, etc.)

**Source:** `ENTRY_CONFIGS[EntryType.Character].icon`

**Format:** Already rendered `ReactNode` components (not icon components)

**When to Use:**
- ✅ Content cards and grid views
- ✅ Skeleton loaders (layout matching)
- ✅ Category displays
- ✅ Anywhere showing content types

**How to Use:**
```tsx
import { getEntryConfig } from "@lib/content-editor/entry-config";
import { EntryType } from "@lib/content-editor/constants";

// Get config (always returns a config - graceful defaults)
const config = getEntryConfig(EntryType.Character);

// Icon is already a ReactNode - use directly
const Icon = config.icon; // ✅ Correct

// Display name respects DB overrides
const displayName = config.displayName;
```

**Graceful Defaults:**
- `getEntryConfig()` always returns a config (never null)
- If category is invalid, components should default to `FileText` icon
- Icons are pre-rendered with className, ready to use

**Example:**
```tsx
// CodexSidebar.tsx
const categoryConfig = useMemo(() => {
  if (!category) return null;
  const entryType = CATEGORY_TO_ENTRY_TYPE[category];
  const entryConfig = getEntryConfig(entryType);
  return {
    icon: entryConfig.icon, // ✅ Uses config
    displayName: entryConfig.displayName,
  };
}, [category]);

// Graceful fallback
const Icon = categoryConfig?.icon || <FileText className="w-4 h-4" />;
```

---

## 2. Toast Icons (UI Feedback)

**Location:** `components/ui/Toaster.tsx`

**Purpose:** Notification icons (success, error, warning, info)

**Source:** Direct imports from `lucide-react`

**Format:** Icon components that need to be rendered

**When to Use:**
- ✅ Toast notifications
- ✅ Error messages
- ✅ Success indicators
- ✅ Any UI feedback/notification

**How to Use:**
```tsx
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { toast } from "@/lib/hooks/useToast";

// Toast automatically uses correct icon
toast.success("Saved!"); // Uses CheckCircle2
toast.error("Failed!"); // Uses XCircle
```

**Icons Used:**
- Success: `CheckCircle2` (green)
- Error: `XCircle` (red)
- Warning: `AlertCircle` (amber)
- Info: `Info` (blue)

---

## 3. Navigation Icons (UI Navigation)

**Location:** `components/SidebarNav.tsx`, `app/content-editor/[projectId]/settings/page.tsx`

**Purpose:** Navigation and settings icons

**Source:** Direct imports from `lucide-react` or icon maps

**Format:** Icon components

**When to Use:**
- ✅ Navigation menus
- ✅ Settings pages
- ✅ Sidebar items
- ✅ UI navigation elements

**How to Use:**
```tsx
import { Settings, Home, BookOpen } from "lucide-react";

// Direct use in navigation
<Settings className="w-4 h-4" />
```

**Graceful Defaults:**
- Settings page defaults to `Settings` icon if icon is missing
- SidebarNav uses `ICON_MAP` with fallbacks

---

## Rules & Best Practices

### ✅ DO:
- **Content types:** Always use `getEntryConfig(entryType).icon`
- **Toast notifications:** Use lucide-react icons directly
- **Navigation:** Use lucide-react icons directly
- **Graceful defaults:** Always provide fallback icons
- **Respect config system:** Use helpers, never hardcode content icons

### ❌ DON'T:
- **Never hardcode** content type icons (User, MapPin, etc.)
- **Don't mix systems:** Don't use entry config icons in toasts
- **Don't assume** icon format - entry config icons are ReactNode, toast icons are components
- **Don't skip defaults:** Always handle missing configs gracefully

---

## Examples

### ✅ Correct - Content Card Using Config
```tsx
import { getEntryConfig } from "@lib/content-editor/entry-config";
import { EntryType } from "@lib/content-editor/constants";

const config = getEntryConfig(EntryType.Character);
const Icon = config.icon; // Already ReactNode

<div>
  <span>{Icon}</span>
  <h3>{config.displayName}</h3>
</div>
```

### ✅ Correct - Toast Using Lucide Icons
```tsx
import { toast } from "@/lib/hooks/useToast";

toast.success("Saved successfully");
// Automatically uses CheckCircle2 from Toaster.tsx
```

### ✅ Correct - Settings Navigation
```tsx
import { Settings, Gamepad2 } from "lucide-react";

const Icon = item.icon || Settings; // Graceful default

<Icon className="w-4 h-4" />
```

### ❌ Wrong - Hardcoded Content Icon
```tsx
// DON'T DO THIS
import { User } from "lucide-react";
const Icon = <User className="w-4 h-4" />; // ❌ Hardcoded

// DO THIS INSTEAD
const config = getEntryConfig(EntryType.Character);
const Icon = config.icon; // ✅ From config
```

---

## Summary

| Context | Icon System | Source | Format |
|---------|------------|--------|--------|
| Content types | Entry Config | `getEntryConfig().icon` | ReactNode |
| Toast notifications | Lucide React | Direct import | Component |
| Navigation | Lucide React | Direct import | Component |
| Settings | Lucide React | Direct import | Component |

**Key Principle:** Content icons come from config, UI icons come from lucide-react.

