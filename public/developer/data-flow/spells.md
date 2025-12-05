# Spells Data Flow

## Storage

Spells are stored in SQLite database (`data/spells.db`). Changes are persisted immediately. The database file can be version controlled.

## Source Path
- **Database**: `data/spells.db`
- **Type Definitions**: `lib/data/namedSpells.ts`

## Data Flow

1. **Load**: Spells are read from the database when the editor loads
2. **Edit**: Changes are made through the Developer Workbench UI
3. **Save**: Changes are written to the database immediately
4. **Runtime**: Game services read from the database via repositories

## Merge Strategy

Spells are stored in SQLite database. Changes are persisted immediately. The database file can be version controlled.

