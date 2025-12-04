// Client-side utility to load books from file system via API

export interface ScannedBook {
  id: string;
  title: string;
  description: string;
  basePath: string;
  chapters: Array<{
    chapterNumber: number;
    chapterName: string;
    displayName: string;
    pages: Array<{
      chapterNumber: number;
      chapterName: string;
      pageNumber: number;
      fileName: string;
      contentPath: string;
      imagePath?: string;
    }>;
  }>;
  stories: Array<{
    id: string;
    title: string;
    path: string;
  }>;
  totalPages: number;
}

export interface BookData {
  id: string;
  title: string;
  description: string;
  basePath: string;
  chapters: Array<{
    chapterNumber: number;
    chapterName: string;
    displayName: string;
    pages: Array<{
      chapterNumber: number;
      chapterName: string;
      pageNumber: number;
      fileName: string;
      contentPath: string;
      imagePath?: string;
    }>;
  }>;
  totalPages: number;
}

export interface BookPage {
  chapterNumber: number;
  chapterName: string;
  pageNumber: number;
  fileName: string;
  contentPath: string;
  imagePath?: string;
}

export interface BookChapter {
  chapterNumber: number;
  chapterName: string;
  displayName: string;
  pages: BookPage[];
}

/**
 * Load all books from file system
 */
export async function loadBooksFromFileSystem(): Promise<ScannedBook[]> {
  try {
    const response = await fetch('/api/books/scan');
    if (!response.ok) {
      throw new Error('Failed to load books');
    }
    const data = await response.json();
    return data.books || [];
  } catch (error) {
    console.error('Error loading books from file system:', error);
    return [];
  }
}

/**
 * Get a specific book by ID
 */
export async function getBookById(bookId: string): Promise<ScannedBook | null> {
  const books = await loadBooksFromFileSystem();
  return books.find(b => b.id === bookId) || null;
}

/**
 * Get all pages in order for a book
 */
export function getAllPages(book: ScannedBook): BookPage[] {
  return book.chapters.flatMap((chapter) => chapter.pages);
}

/**
 * Get page by page number
 */
export function getPageByNumber(book: ScannedBook, pageNumber: number): BookPage | undefined {
  return getAllPages(book).find((page) => page.pageNumber === pageNumber);
}

/**
 * Get next/previous page
 */
export function getNextPage(book: ScannedBook, currentPageNumber: number): BookPage | null {
  const allPages = getAllPages(book);
  const currentIndex = allPages.findIndex((p) => p.pageNumber === currentPageNumber);
  return currentIndex >= 0 && currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
}

export function getPreviousPage(book: ScannedBook, currentPageNumber: number): BookPage | null {
  const allPages = getAllPages(book);
  const currentIndex = allPages.findIndex((p) => p.pageNumber === currentPageNumber);
  return currentIndex > 0 ? allPages[currentIndex - 1] : null;
}

