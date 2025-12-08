// Server-side book scanner utility
// These functions use Node.js filesystem APIs and can only be used in server components

import { readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import type { BookPage } from "./book-scanner";

// Re-export types from API route
export interface ScannedBook {
  id: string;
  title: string;
  description: string;
  basePath: string;
  chapters: Chapter[];
  stories: Story[];
  totalPages: number;
}

interface Chapter {
  chapterNumber: number;
  chapterName: string;
  displayName: string;
  pages: Page[];
}

interface Page {
  chapterNumber: number;
  chapterName: string;
  pageNumber: number;
  fileName: string;
  contentPath: string;
  imagePath: string;
}

interface Story {
  id: string;
  title: string;
  path: string;
}

/**
 * Generate image path for a page
 */
function getImagePath(bookId: string, chapterNumber: number, pageInChapter: number): string {
  const chapterStr = chapterNumber.toString().padStart(2, '0');
  const pageStr = pageInChapter.toString().padStart(3, '0');
  return `/books/${bookId}/images/ch${chapterStr}-p${pageStr}.png`;
}

/**
 * Parse chapter folder name to extract chapter info
 */
function parseChapterFolder(folderName: string): { chapterNumber: number; chapterName: string; displayName: string } | null {
  const match = folderName.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  
  const chapterNum = parseInt(match[1], 10);
  const name = match[2];
  
  let displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  if (chapterNum === 0) {
    displayName = "Prologue";
  } else {
    displayName = `Chapter ${chapterNum}: ${displayName}`;
  }
  
  return {
    chapterNumber: chapterNum,
    chapterName: name,
    displayName,
  };
}

/**
 * Format book title from folder name
 */
function formatBookTitle(folderName: string): string {
  return folderName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Scan a single book folder for chapters and stories
 */
async function scanBookFolder(bookId: string, bookPath: string): Promise<ScannedBook | null> {
  const chaptersPath = join(bookPath, 'chapters');
  const storiesFolderPath = join(bookPath, 'stories');
  
  const chapters: Chapter[] = [];
  const stories: Story[] = [];
  
  // Scan chapters folder
  if (existsSync(chaptersPath)) {
    const chapterFolders = await readdir(chaptersPath, { withFileTypes: true });
    
    const parsedChapters = chapterFolders
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => {
        const parsed = parseChapterFolder(entry.name);
        return parsed ? { ...parsed, folderName: entry.name } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    for (const chapterInfo of parsedChapters) {
      const chapterPath = join(chaptersPath, chapterInfo.folderName);
      const files = await readdir(chapterPath);
      
      const mdFiles = files
        .filter(f => f.endsWith('.md'))
        .sort();
      
      const pages: Page[] = mdFiles.map((fileName, index) => {
        const pageInChapter = index + 1;
        const pageMatch = fileName.match(/page-(\d+)/);
        const pageNumber = pageMatch ? parseInt(pageMatch[1], 10) : pageInChapter;
        
        return {
          chapterNumber: chapterInfo.chapterNumber,
          chapterName: chapterInfo.chapterName,
          pageNumber,
          fileName,
          contentPath: `/books/${bookId}/chapters/${chapterInfo.folderName}/${fileName}`,
          imagePath: getImagePath(bookId, chapterInfo.chapterNumber, pageInChapter),
        };
      });
      
      if (pages.length > 0) {
        chapters.push({
          chapterNumber: chapterInfo.chapterNumber,
          chapterName: chapterInfo.chapterName,
          displayName: chapterInfo.displayName,
          pages,
        });
      }
    }
  }
  
  // Scan stories folder
  if (existsSync(storiesFolderPath)) {
    const storyFiles = await readdir(storiesFolderPath);
    const mdStories = storyFiles.filter(f => f.endsWith('.md'));
    
    for (const storyFile of mdStories) {
      const storyId = storyFile.replace('.md', '');
      const title = storyId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      stories.push({
        id: storyId,
        title,
        path: `books/${bookId}/stories/${storyId}`,
      });
    }
  }
  
  const totalPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);
  const title = formatBookTitle(bookId);
  
  return {
    id: bookId,
    title,
    description: `Stories from ${title}`,
    basePath: `/books/${bookId}`,
    chapters,
    stories,
    totalPages,
  };
}

/**
 * Load all books from file system (server-side)
 */
export async function loadBooksFromFileSystemServer(): Promise<ScannedBook[]> {
  try {
    const publicBooksPath = join(process.cwd(), 'public', 'books');
    
    if (!existsSync(publicBooksPath)) {
      return [];
    }
    
    const bookFolders = await readdir(publicBooksPath, { withFileTypes: true });
    const books: ScannedBook[] = [];
    
    for (const entry of bookFolders) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const bookPath = join(publicBooksPath, entry.name);
        const book = await scanBookFolder(entry.name, bookPath);
        if (book) {
          books.push(book);
        }
      }
    }
    
    return books;
  } catch (error) {
    console.error('Error loading books from file system:', error);
    return [];
  }
}

/**
 * Get all pages in order for a book (server-side)
 */
export function getAllPages(book: ScannedBook): BookPage[] {
  return book.chapters.flatMap((chapter) => chapter.pages);
}

/**
 * Get page by page number (server-side)
 */
export function getPageByNumber(book: ScannedBook, pageNumber: number): BookPage | undefined {
  return getAllPages(book).find((page) => page.pageNumber === pageNumber);
}

/**
 * Get book page data from path (server-side)
 */
export async function getBookPageFromPathServer(path: string): Promise<{ book: ScannedBook; page: BookPage } | null> {
  try {
    const books = await loadBooksFromFileSystemServer();
    
    for (const book of books) {
      const pages = getAllPages(book);
      const page = pages.find(p => 
        p.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, '') === path
      );
      if (page) {
        return { book, page };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error loading book page data:", error);
    return null;
  }
}

