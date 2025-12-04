# Design Documentation Structure

This folder contains all design documentation for Magicborn: Modred's Legacy.

## Organization

- **Main Document**: `overall_concept_design_guide.md` - The primary design document
- **Categories**: Create subfolders for different categories:
  - `creatures/` - Creature design documentation
  - `characters/` - Character design documentation  
  - `spells/` - Spell and magic system documentation
  - `combat/` - Combat system documentation
  - `dialogue/` - Dialogue system documentation
  - `particle-effects/` - Particle effects and visual effects
  - `rune-system/` - Rune system documentation
  - etc.

## Adding Documentation

1. Create a markdown file (`.md`) in the appropriate category folder
2. Use standard markdown syntax
3. Images should be placed in the `public/design/` folder structure and referenced in markdown

### Image Paths

Images can be referenced in several ways:

**Absolute paths (recommended):**
```markdown
![Description](/design/images/spellcrafting-scene.png)
![Character Design](/design/characters/protagonist-concept.png)
```

**Relative paths:**
```markdown
![Description](./images/local-image.png)
![Description](../shared/concept-art.png)
```

**From public root:**
```markdown
![Game Art](/images/game_scenes.webp)
```

### Recommended Image Structure

```
public/
├── design/
│   ├── images/          # General design images
│   ├── characters/      # Character design images
│   ├── creatures/       # Creature design images
│   ├── spells/          # Spell/combat images
│   ├── environments/    # Environment concept art
│   └── ui/              # UI/interface images
```

### Image Best Practices

- Use **WebP** format for best compression and quality
- Keep images optimized (recommended max width: 1920px for documentation)
- Include descriptive alt text for accessibility
- Group related images in subfolders by category

## Markdown Features

- Headers (H1-H4) automatically generate table of contents
- Images are automatically styled and displayed
- Code blocks are syntax highlighted
- Design tokens can be injected using `{{color:ember}}` syntax

