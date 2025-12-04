/**
 * Type definitions for books and stories
 * Actual data is loaded from file system in public/books/
 */

export type BookId = string;
export type StoryId = string;

// These are minimal types - actual data comes from file system
export interface StoryMetadata {
  id: StoryId;
  bookId: BookId;
  title: string;
  excerpt?: string;
  contentPath: string;
  order?: number;
  date?: string;
  readingTime?: number;
  tags?: string[];
}

