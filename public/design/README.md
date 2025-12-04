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
3. Images should be placed in the same folder or a subfolder, and referenced relatively:
   - `![Alt text](./image.png)` - Image in same folder
   - `![Alt text](../images/image.png)` - Image in parent images folder
   - `![Alt text](/design/category/image.png)` - Absolute path from public folder

## Markdown Features

- Headers (H1-H4) automatically generate table of contents
- Images are automatically styled and displayed
- Code blocks are syntax highlighted
- Design tokens can be injected using `{{color:ember}}` syntax

