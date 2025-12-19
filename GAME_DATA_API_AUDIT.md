# Game Data API Audit

## Status: Migration to Payload CMS

This document tracks which `/app/api/game-data/**` routes have been migrated to Payload CMS and can be safely removed.

---

## ✅ Migrated to Payload (Can Remove)

### `/app/api/game-data/characters`
- **Status**: ✅ Fully migrated
- **Payload Collection**: `characters`
- **New Endpoint**: `/api/payload/characters`
- **Usage**: All components now use Payload API
- **Action**: ✅ **SAFE TO DELETE**

### `/app/api/game-data/effects`
- **Status**: ✅ Fully migrated
- **Payload Collection**: `effects`
- **New Endpoint**: `/api/payload/effects`
- **Usage**: All components now use Payload API
- **Action**: ✅ **SAFE TO DELETE**

### `/app/api/game-data/spells`
- **Status**: ✅ Fully migrated
- **Payload Collection**: `spells`
- **New Endpoint**: `/api/payload/spells`
- **Usage**: All components now use Payload API
- **Action**: ✅ **SAFE TO DELETE**

### `/app/api/game-data/images/upload`
- **Status**: ✅ Already deleted
- **Replaced by**: `/api/payload/media`
- **Action**: ✅ **ALREADY REMOVED**

---

## ⚠️ Still Needed (No Payload Collection Yet)

### `/app/api/game-data/creatures`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist
- **Usage**: CreatureForm, CreatureEditor
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/runes`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist (but `Runes` is in constants)
- **Usage**: RuneForm, RuneEditor
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/maps`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist
- **Usage**: MapForm, MapEditor
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/ids`
- **Status**: ⚠️ Still in use
- **Purpose**: ID validation endpoint
- **Usage**: May be used by old clients (IdInput uses Payload API directly)
- **Action**: ⏳ **REVIEW** - Check if still needed, IdInput uses Payload API

---

## ❌ Removed (No Longer Needed)

### `/app/api/game-data/environments`
- **Status**: ❌ Removed
- **Reason**: Old canvas-based map editor removed, not needed
- **Action**: ✅ **DELETED**

### `/app/api/game-data/map-regions`
- **Status**: ❌ Removed
- **Reason**: Old map editor removed, regions now handled by Locations collection
- **Action**: ✅ **DELETED**

### `/app/api/game-data/map-placements`
- **Status**: ❌ Removed
- **Reason**: Old map editor removed, not needed
- **Action**: ✅ **DELETED**

### `/app/api/game-data/stories`
- **Status**: ❌ Removed
- **Reason**: Covered by Lore collection
- **Action**: ✅ **DELETED**

### Old Map Editor Components
- **Status**: ❌ Removed
- **Components Deleted**:
  - `EnvironmentEditor.tsx`
  - `MapCanvas.tsx`
  - `CellSelectionFeedback.tsx`
  - `CellSelectionLayer.tsx`
  - `GridLayer.tsx`
  - `StatusBar.tsx`
  - `RegionEditForm.tsx`
  - `WorldRegionForm.tsx`
  - `MapImageUpload.tsx`
  - `EnvironmentForm.tsx`
  - `EnvironmentSelector.tsx`
  - `InheritanceChainDisplay.tsx`
  - `AreaInfoDisplay.tsx`
- **Action**: ✅ **DELETED** - Entire `components/environment/` directory removed

---

## 📋 Cleanup Tasks

### Immediate (Safe to Remove)
- [x] Remove `/app/api/game-data/images/upload` ✅ DONE
- [ ] Remove `/app/api/game-data/characters`
- [ ] Remove `/app/api/game-data/effects`
- [ ] Remove `/app/api/game-data/spells`
- [ ] Update `lib/api/clients.ts` to remove old client functions
- [ ] Update `lib/swagger.ts` to remove old endpoints

### Future (After Payload Collections Created)
- [ ] Create Payload collection for `creatures`
- [ ] Create Payload collection for `runes`
- [ ] Create Payload collection for `environments`
- [ ] Create Payload collection for `maps`
- [ ] Create Payload collection for `map-placements` (or use Locations)
- [ ] Migrate `stories` to use `lore` collection
- [ ] Update `ids` endpoint to use Payload API

---

## 📝 Notes

- All new content should use Payload CMS exclusively
- Old routes are kept temporarily for backward compatibility
- Once all collections are migrated, we can remove the entire `/app/api/game-data/` directory
- The `lib/api/clients.ts` file should be updated or removed once all routes are migrated

---

**Last Updated**: 2025-12-19  
**Branch**: `feature/data-centric-map-regions`

