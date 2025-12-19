# Outdated Code & Cleanup Tasks

This document tracks code that has been superseded by Payload CMS migration and needs to be cleaned up.

## Status: Migration to Payload CMS Complete

As of the latest commit, we have successfully migrated to Payload CMS as the single source of truth for all content. The following code is now **outdated** and should be removed or refactored.

---

## 🗑️ Outdated API Routes

### `/app/api/game-data/**` - **DEPRECATED**

All routes in this directory are **no longer used** and should be removed:

- ✅ **Migrated to Payload:**
  - `/api/game-data/characters` → `/api/payload/characters`
  - `/api/game-data/images/upload` → `/api/payload/media` (Payload Media)
  
- ⚠️ **Still in use (needs migration):**
  - `/api/game-data/creatures` - Needs Payload collection
  - `/api/game-data/spells` - Needs Payload collection (may already exist)
  - `/api/game-data/effects` - Needs Payload collection (may already exist)
  - `/api/game-data/runes` - Needs Payload collection (may already exist)
  - `/api/game-data/maps` - Needs Payload collection
  - `/api/game-data/environments` - Needs Payload collection
  - `/api/game-data/map-regions` - Needs Payload collection
  - `/api/game-data/map-placements` - Needs Payload collection
  - `/api/game-data/ids` - May not be needed with Payload

**Action Required:** 
- Verify which collections already exist in Payload
- Migrate remaining endpoints to Payload
- Remove `/app/api/game-data/**` directory once all are migrated

---

## 🗑️ Outdated Components

### `ImageUpload` Component - **PARTIALLY DEPRECATED**

**Location:** `components/ui/ImageUpload.tsx`

**Status:** Still used by some forms, but should be replaced with `MediaUpload`

**Current Usage:**
- ✅ **Migrated to MediaUpload:**
  - `CharacterForm` - Now uses `MediaUpload`
  - `RegionForm` - Now uses `MediaUpload`
  
- ⚠️ **Still using ImageUpload (needs migration):**
  - `SpellForm` - Uses old `/api/game-data/images/upload`
  - `EffectForm` - Uses old `/api/game-data/images/upload`
  - `RuneForm` - Uses old `/api/game-data/images/upload`
  - `CreatureForm` - Uses old `/api/game-data/images/upload`
  - `ObjectForm` - Uses old `/api/game-data/images/upload`
  - `LoreForm` - Uses old `/api/game-data/images/upload`
  - `MapImageUpload` - Uses old file system
  - `EnvironmentForm` - Uses old file system
  - `MapForm` - Uses old file system
  - `WorldRegionForm` - Uses old file system
  - `RegionEditForm` - Uses old file system

**Action Required:**
- Replace all `ImageUpload` usages with `MediaUpload`
- Update all forms to use Payload Media
- Remove `ImageUpload` component once all forms are migrated

---

## 🗑️ Outdated Data Clients

### `lib/api/clients.ts` - **PARTIALLY DEPRECATED**

**Status:** Contains old API clients that may still be in use

**Action Required:**
- Audit all usages of clients in this file
- Replace with Payload API calls (`/api/payload/{collection}`)
- Remove unused client functions

---

## 🗑️ Old File Storage Locations

### `/public/game-content/**` - **DEPRECATED**

**Status:** Old file storage location. New uploads go to Payload Media (`/media/`)

**Action Required:**
- Migrate existing files to Payload Media (if needed)
- Update any hardcoded references to `/game-content/` paths
- Consider removing this directory after migration

---

## 🗑️ Old Database Files

### SQLite Databases (non-Payload)

**Files:**
- `data/spells.db` - May be superseded by Payload
- Other `.db` files in `data/` directory

**Action Required:**
- Verify if these databases are still needed
- Migrate data to Payload if needed
- Remove if obsolete

---

## 📋 Cleanup TODO List

### High Priority

- [ ] **Remove `/app/api/game-data/images/upload/route.ts`**
  - No longer used after migration to Payload Media
  - All forms now use `/api/payload/media`

- [ ] **Migrate remaining forms to MediaUpload:**
  - [ ] `SpellForm.tsx`
  - [ ] `EffectForm.tsx`
  - [ ] `RuneForm.tsx`
  - [ ] `CreatureForm.tsx`
  - [ ] `ObjectForm.tsx`
  - [ ] `LoreForm.tsx`

- [ ] **Migrate environment/map forms:**
  - [ ] `MapImageUpload.tsx`
  - [ ] `EnvironmentForm.tsx`
  - [ ] `MapForm.tsx`
  - [ ] `WorldRegionForm.tsx`
  - [ ] `RegionEditForm.tsx`

### Medium Priority

- [ ] **Audit and remove unused API routes:**
  - [ ] `/api/game-data/creatures`
  - [ ] `/api/game-data/spells`
  - [ ] `/api/game-data/effects`
  - [ ] `/api/game-data/runes`
  - [ ] `/api/game-data/maps`
  - [ ] `/api/game-data/environments`
  - [ ] `/api/game-data/map-regions`
  - [ ] `/api/game-data/map-placements`
  - [ ] `/api/game-data/ids`

- [ ] **Remove ImageUpload component:**
  - After all forms are migrated to MediaUpload
  - Update all imports

- [ ] **Clean up old file storage:**
  - Migrate `/public/game-content/**` files to Payload Media
  - Remove directory after migration

### Low Priority

- [ ] **Clean up old database files:**
  - Verify `data/spells.db` is still needed
  - Migrate or remove obsolete databases

- [ ] **Update AI tools:**
  - `lib/ai/tools/game-data-tools.ts` - May reference old APIs
  - `infra/ai-stack/openwebui-tools/magicborn_game_data.py` - May reference old APIs

- [ ] **Update documentation:**
  - Remove references to old API endpoints
  - Update developer docs to reflect Payload-only approach

---

## ✅ Completed Migrations

- ✅ Character images → Payload Media
- ✅ Region images → Payload Media
- ✅ Landmark icons → Payload Media
- ✅ Character CRUD → Payload API
- ✅ Region CRUD → Payload API
- ✅ Grid validation system for regions
- ✅ Deferred upload system (upload on form submission)

---

## 📝 Notes

- All new content should use Payload CMS exclusively
- The old `game-data` API routes are kept temporarily for backward compatibility
- Once all forms are migrated, we can safely remove the old API routes
- Payload Media provides versioning, drafts, and better file management

---

**Last Updated:** 2025-12-19  
**Branch:** `feature/data-centric-map-regions`

