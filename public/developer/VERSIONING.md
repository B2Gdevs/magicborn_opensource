# Versioning & Snapshots

The Content Editor uses a two-tier versioning system powered by Payload CMS:

1. **Entity-level versions** - automatic version history for individual items
2. **Project snapshots** - manual checkpoints capturing entire project state

---

## Entity-Level Versions

Every content type (Acts, Chapters, Scenes, Characters, etc.) has automatic versioning enabled.

### How It Works

- **Automatic**: Every time you update an entity, Payload creates a version entry
- **Draft support**: Content can exist in draft or published state
- **History limit**: Each entity keeps up to 25 versions (configurable in collection config)

### Payload Configuration

Each collection has versioning enabled:

```typescript
// lib/payload/collections/Scenes.ts
export const Scenes: CollectionConfig = {
  slug: 'scenes',
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
  // ...
}
```

### Viewing Entity Versions

1. Click **Versions** button in the top navigation
2. Select the entity tab (Acts, Chapters, Scenes, Characters)
3. View the version history with timestamps
4. Click the restore button to revert to a previous version

### API Endpoints

```bash
# Get versions for a specific entity
GET /api/payload/scenes/{id}/versions

# Restore a version (use the version ID)
POST /api/payload/scenes/{id}/versions/{versionId}
```

---

## Project Snapshots

Project snapshots capture the **entire state** of all content at a point in time.

### Use Cases

- Before major rewrites or restructuring
- Publishing a "release" version
- Creating backup points before AI-assisted edits
- Comparing different story directions

### How It Works

1. When you create a snapshot, the system fetches ALL current content:
   - Acts, Chapters, Scenes
   - Characters
   - (Future: Locations, Objects, Lore, etc.)

2. Everything is stored as a JSON blob in the `project-snapshots` collection

3. Snapshots are tagged with a type:
   - **Checkpoint** - Working backup point
   - **Published** - Official release version
   - **Draft** - Work in progress

### Creating a Snapshot

1. Click **Versions** in the top navigation
2. Go to the **Project Snapshots** tab
3. Enter a descriptive name (e.g., "Before Act 3 rewrite")
4. Click **Save Checkpoint** or **Publish**

### Restoring a Snapshot

1. Click **Versions** → **Project Snapshots**
2. Find the snapshot you want to restore
3. Click **Restore**
4. Confirm the action (this will overwrite current content)

> ⚠️ **Warning**: Restoring a snapshot replaces ALL current content with the snapshot data. Consider creating a new checkpoint before restoring.

### Snapshot Data Structure

```typescript
interface ProjectSnapshot {
  id: string;
  project: number;           // Project ID
  name: string;              // User-provided name
  type: 'draft' | 'published' | 'checkpoint';
  snapshot: {
    acts: Act[];
    chapters: Chapter[];
    scenes: Scene[];
    characters: Character[];
    timestamp: string;       // ISO timestamp
  };
  createdAt: string;
  createdBy?: number;        // User ID
}
```

---

## Draft vs Published Workflow

### Entity Level

Each entity has a `_status` field:
- `draft` - Work in progress, not visible in published view
- `published` - Finalized content

### Project Level

Use snapshot types to manage releases:
1. Work on content (all saves are drafts)
2. Create a **Checkpoint** before major changes
3. When ready, create a **Published** snapshot
4. Continue editing (drafts won't affect published version)
5. Later, create another **Published** snapshot for the next release

---

## Autosave Behavior

The Content Editor shows save status in the top navigation:

| Status | Icon | Meaning |
|--------|------|---------|
| Saved | ☁️ (green) | All changes persisted to database |
| Saving | ⏳ (spinner) | Currently writing to database |
| Unsaved | 🟡 (amber dot) | Local changes not yet saved |
| Error | ☁️❌ (red) | Save failed, retry or check connection |

- Changes are saved immediately when you create/update/delete entities
- The timestamp shows when the last successful save occurred

---

## Recovery Scenarios

### "I accidentally deleted an Act"

1. If you have a recent snapshot: **Restore** the snapshot
2. If no snapshot: Check if you have database backups

### "I want to see what a Scene looked like yesterday"

1. Click **Versions** → **Scenes** tab
2. Find the version from yesterday by timestamp
3. Click restore to revert, or just view the content

### "I need to compare two versions of my story"

1. Create a **Checkpoint** of current state
2. **Restore** the older snapshot you want to compare
3. Review the content
4. **Restore** back to the checkpoint you just created

### "I want to branch my story into two directions"

1. Create a **Checkpoint** named "Branch Point"
2. Continue editing (Direction A)
3. When ready to try Direction B:
   - Create a checkpoint of Direction A
   - Restore "Branch Point"
   - Edit for Direction B
4. You can now switch between Direction A and B checkpoints

---

## Database Structure

### Version Tables (auto-created by Payload)

- `_scenes_v` - Scene versions
- `_chapters_v` - Chapter versions  
- `_acts_v` - Act versions
- `_characters_v` - Character versions

### Snapshot Table

- `project-snapshots` - Full project snapshots

---

## Best Practices

1. **Create checkpoints before major changes** - Always snapshot before restructuring acts, deleting content, or major rewrites

2. **Use descriptive names** - "Before Act 3 rewrite" is better than "Backup 1"

3. **Publish milestones** - Use Published snapshots for significant versions (first draft complete, after editor feedback, etc.)

4. **Don't rely solely on entity versions** - They have a limit (25 per entity). Use project snapshots for important states.

5. **Regular checkpoints during long sessions** - If you're editing for hours, create periodic checkpoints

---

## Technical Notes

### Payload Local API

Versions are fetched using Payload's local API:

```typescript
// Fetch versions for an entity
const versions = await payload.findVersions({
  collection: 'scenes',
  where: { parent: { equals: sceneId } },
  limit: 20,
  sort: '-updatedAt',
})

// Restore a version
await payload.restoreVersion({
  collection: 'scenes',
  id: versionId,
})
```

### API Route Handler

Custom route at `/api/payload/[...slug]/route.ts` handles:
- `GET /{collection}/{id}/versions` - Fetch version history
- Standard CRUD for all collections



