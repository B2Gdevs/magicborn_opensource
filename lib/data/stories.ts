/**
 * Story and Book data structure
 * Stories are organized by books, with relationships between them
 */

export type BookId = "tale_of_modred" | "modreds_legacy";
export type StoryId = string;

export interface Story {
  id: StoryId;
  bookId: BookId;
  title: string;
  excerpt: string;
  contentPath: string; // Path to markdown file in public/stories/
  order: number; // Order within the book
  date?: string;
  readingTime?: number; // Estimated reading time in minutes
  tags?: string[];
}

export interface Book {
  id: BookId;
  title: string;
  description: string;
  coverImage?: string;
  isPrequel: boolean;
  stories: Story[];
  order: number;
}

export const BOOKS: Book[] = [
  {
    id: "tale_of_modred",
    title: "The Tale of Modred",
    description: "The prequel to Modred's Legacy. The origin story of Modred the Shadow-Weaver and how he discovered the true power of runes.",
    isPrequel: true,
    order: 1,
    stories: [
      // This is a multi-page book - use /books/tale-of-modred route instead
      // Individual stories from this book can be added here if needed
    ],
  },
  {
    id: "modreds_legacy",
    title: "Modred's Legacy",
    description: "The main timeline of the game. Stories of oppressed magicborn, military slaves, and those who craft spells to survive in a godforsaken land.",
    isPrequel: false,
    order: 2,
    stories: [
      // Short stories will be added here
      // Example:
      // {
      //   id: "first_spell",
      //   bookId: "modreds_legacy",
      //   title: "The First Spell",
      //   excerpt: "A magicborn slave discovers the power of crafting their first spell...",
      //   contentPath: "/stories/modreds_legacy/first_spell.md",
      //   order: 1,
      //   readingTime: 8,
      // }
    ],
  },
];

export function getBookById(id: BookId): Book | undefined {
  return BOOKS.find((book) => book.id === id);
}

export function getAllBooks(): Book[] {
  return BOOKS.sort((a, b) => a.order - b.order);
}

export function getStoriesByBook(bookId: BookId): Story[] {
  const book = getBookById(bookId);
  return book ? [...book.stories].sort((a, b) => a.order - b.order) : [];
}

export function getAllStories(): Story[] {
  return BOOKS.flatMap((book) => book.stories);
}

export function getStoryById(id: StoryId): Story | undefined {
  return getAllStories().find((story) => story.id === id);
}

