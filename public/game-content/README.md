# Game Content Assets

This folder contains all game content assets that are used in the game and managed through the Content Editor.

## Structure

```
game-content/
├── environments/     # Environment images/thumbnails
│   └── {environmentId}.png
├── maps/            # Map reference images (2D backgrounds for map editor)
│   └── {mapId}.png
└── props/           # Prop images (for future prop editor)
    └── {propId}.png
```

## Usage

- **Environments:** Top-level location images (e.g., "Tarro", "Wildlands")
- **Maps:** 2D reference images used as backgrounds in the map editor
- **Props:** Images for interactive/decorative objects (future feature)

## Image Paths

Images are stored here and referenced in the database:
- Database stores: `game-content/environments/tarro.png`
- Accessed in app: `/game-content/environments/tarro.png` (Next.js public folder)

