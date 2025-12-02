# Stories Directory

This directory contains all story content organized by book.

## Structure

```
public/stories/
├── tale_of_modred/     # Book 1: The Tale of Modred (Prequel)
│   └── *.md           # Story markdown files
└── modreds_legacy/     # Book 2: Modred's Legacy (Main Timeline)
    └── *.md           # Story markdown files
```

## Adding Stories

1. Create a markdown file in the appropriate book folder
2. Add the story entry to `lib/data/stories.ts` in the `BOOKS` array
3. Set the `contentPath` to match your markdown file location

### Example Story Entry

```typescript
{
  id: "first_spell",
  bookId: "modreds_legacy",
  title: "The First Spell",
  excerpt: "A magicborn slave discovers the power of crafting their first spell...",
  contentPath: "/stories/modreds_legacy/first_spell.md",
  order: 1,
  readingTime: 8,
  date: "2024-12-02",
  tags: ["origin", "spell-crafting"]
}
```

## Markdown Formatting

The story reader supports:
- Headers: `#`, `##`, `###`
- Bold: `**text**`
- Italic: `*text*`
- Paragraphs: Double line breaks

## Timeline

- **The Tale of Modred**: Prequel - Origin story of Modred the Shadow-Weaver
- **Modred's Legacy**: Main timeline - Where the game and short stories take place

