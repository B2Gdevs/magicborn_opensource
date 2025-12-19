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

### `/app/api/game-data/environments`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist
- **Usage**: EnvironmentForm, EnvironmentEditor
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/maps`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist
- **Usage**: MapForm, MapEditor
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/map-regions`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist (but `Locations` might cover this)
- **Usage**: MapRegionForm
- **Action**: ⏳ **KEEP** - May be covered by Locations collection

### `/app/api/game-data/map-placements`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ❌ Does not exist
- **Usage**: MapPlacementForm
- **Action**: ⏳ **KEEP** - Need to create Payload collection first

### `/app/api/game-data/stories`
- **Status**: ⚠️ Still in use
- **Payload Collection**: ✅ `lore` exists (may cover this)
- **Usage**: Story listing
- **Action**: ⏳ **KEEP** - Verify if Lore collection covers this

### `/app/api/game-data/ids`
- **Status**: ⚠️ Still in use
- **Purpose**: ID validation endpoint
- **Usage**: IdInput component validation
- **Action**: ⏳ **KEEP** - May need to update to use Payload API

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

