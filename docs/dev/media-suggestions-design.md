# Media & Suggestions System Design

> **Internal developer documentation** - Design for reusable media picker and cross-collection suggestions.

## Overview

A versatile system for:
1. **Media Selection** - Pick from existing uploads or upload new
2. **Cross-Collection Suggestions** - Suggest related items from any collection
3. **Reusable Components** - Use throughout the app

---

## Core Components

### 1. `MediaPicker` - Unified Media Selection

```tsx
interface MediaPickerProps {
  // Current value
  value?: number; // mediaId
  imageUrl?: string;
  
  // Callbacks
  onSelect: (mediaId: number, url: string) => void;
  onRemove: () => void;
  
  // Display
  variant: "thumbnail" | "card" | "inline";
  label?: string;
  
  // Suggestions
  projectId: string;
  suggestFrom?: ("media" | "characters" | "creatures" | "regions")[];
  suggestRelatedTo?: { collection: string; id: string }; // Show related media
}
```

**Variants:**
- `thumbnail` - Small square in toolbar (28x28)
- `card` - Larger card with preview
- `inline` - Full-width upload area

### 2. `SuggestionProvider` - Fetch Suggestions

```tsx
interface SuggestionItem {
  id: string;
  type: "media" | "character" | "creature" | "region" | etc;
  name: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface UseSuggestionsOptions {
  projectId: string;
  collections: string[];
  query?: string; // Search filter
  relatedTo?: { collection: string; id: string };
  limit?: number;
}

function useSuggestions(options: UseSuggestionsOptions): {
  suggestions: SuggestionItem[];
  loading: boolean;
  error: string | null;
}
```

### 3. `SuggestionList` - Display Suggestions

```tsx
interface SuggestionListProps {
  suggestions: SuggestionItem[];
  onSelect: (item: SuggestionItem) => void;
  loading?: boolean;
  emptyMessage?: string;
  groupBy?: "type" | "none";
}
```

---

## API Endpoints

### `GET /api/suggestions`

```
GET /api/suggestions?
  projectId=1&
  collections=media,characters&
  relatedTo[collection]=chapters&
  relatedTo[id]=5&
  query=dragon&
  limit=20
```

**Response:**
```json
{
  "suggestions": [
    {
      "id": "123",
      "type": "media",
      "name": "dragon-illustration.png",
      "imageUrl": "/media/dragon-illustration.png",
      "metadata": { "mimeType": "image/png", "size": 1024000 }
    },
    {
      "id": "456",
      "type": "character",
      "name": "Dragonlord Kael",
      "imageUrl": "/media/kael.png",
      "metadata": { "description": "..." }
    }
  ],
  "total": 42
}
```

---

## Suggestion Algorithms

### 1. **Recent Media**
- Most recently uploaded/used media in project
- Weight by recency

### 2. **Related by Context**
- If editing Chapter → suggest media used in same Act
- If editing Character → suggest media from related regions/creatures

### 3. **Text Search**
- Fuzzy match on name, alt text, description
- Weighted by relevance

### 4. **Cross-Collection Relations**
- Characters have images → suggest their images
- Creatures have images → suggest their images
- Regions have landmark icons → suggest those

---

## Implementation Phases

### Phase 1: Basic MediaPicker (Now)
- [x] Thumbnail in toolbar
- [x] Upload popup
- [x] Upload new file
- [x] Remove current
- [ ] View full size

### Phase 2: Media Library
- [ ] Grid of recent uploads
- [ ] Search by filename
- [ ] Filter by type (image, video, etc.)
- [ ] Pagination

### Phase 3: Cross-Collection Suggestions
- [ ] Suggestion API endpoint
- [ ] Related media from entities
- [ ] Smart suggestions based on context

### Phase 4: AI-Powered Suggestions
- [ ] Generate image suggestions based on content
- [ ] Suggest similar images
- [ ] Auto-tag media

---

## Component Usage Examples

### In Detail Views (Act/Chapter/Page)

```tsx
// Toolbar thumbnail
<MediaPicker
  value={imageMediaId}
  imageUrl={imageUrl}
  onSelect={(id, url) => {
    setImageMediaId(id);
    setImageUrl(url);
    triggerAutosave();
  }}
  onRemove={handleRemoveImage}
  variant="thumbnail"
  projectId={projectId}
/>
```

### In Entity Forms (Character/Creature)

```tsx
// Card with suggestions
<MediaPicker
  value={form.watch("imageMediaId")}
  onSelect={(id, url) => form.setValue("imageMediaId", id)}
  onRemove={() => form.setValue("imageMediaId", undefined)}
  variant="card"
  projectId={projectId}
  suggestFrom={["media", "characters"]}
  suggestRelatedTo={{ collection: "regions", id: regionId }}
/>
```

---

## File Structure

```
components/
  media/
    MediaPicker.tsx        # Main picker component
    MediaPopup.tsx         # Popup for full selection
    MediaGrid.tsx          # Grid display of media
    SuggestionList.tsx     # Suggestion display

lib/
  hooks/
    useMediaSuggestions.ts # React Query hook for suggestions
  
app/
  api/
    suggestions/
      route.ts             # Suggestions API
```

---

*Last updated: Dec 2024*


