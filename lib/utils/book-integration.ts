// Integration between book data and documentation system

import { loadBooksFromFileSystem, getAllPages, type ScannedBook, type BookPage } from "./book-scanner";
import type { DocFile } from "./docs-loader";

export interface BookDocument {
  bookId: string;
  bookData: ScannedBook;
  pages: BookPage[];
  stories: Array<{
    id: string;
    title: string;
    path: string;
  }>;
}

/**
 * Get book documents with their pages and stories from file system
 */
export async function getBookDocuments(): Promise<BookDocument[]> {
  const scannedBooks = await loadBooksFromFileSystem();
  
  return scannedBooks.map(book => ({
    bookId: book.id,
    bookData: book,
    pages: getAllPages(book),
    stories: book.stories,
  }));
}

/**
 * Convert book pages to DocFile structure for navigation
 */
export function bookPagesToDocFiles(book: BookDocument): DocFile[] {
  const files: DocFile[] = [];
  
  // Add chapters as subcategories
  book.bookData.chapters.forEach((chapter: ScannedBook['chapters'][0]) => {
    const chapterFiles: DocFile[] = chapter.pages.map((page: ScannedBook['chapters'][0]['pages'][0]) => ({
      name: `Page ${page.pageNumber}`,
      path: page.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, ''),
      category: `books/${book.bookId}/chapters`,
      isDirectory: false,
    }));
    
    files.push({
      name: chapter.displayName,
      path: `books/${book.bookId}/chapters/${chapter.chapterName}`,
      category: `books/${book.bookId}`,
      isDirectory: true,
      children: chapterFiles,
    });
  });
  
  // Add stories if any
  if (book.stories.length > 0) {
    const storyFiles: DocFile[] = book.stories.map(story => ({
      name: story.title,
      path: story.path.replace(/\.md$/, ''),
      category: `books/${book.bookId}/stories`,
      isDirectory: false,
    }));
    
    files.push({
      name: "Short Stories",
      path: `books/${book.bookId}/stories`,
      category: `books/${book.bookId}`,
      isDirectory: true,
      children: storyFiles,
    });
  }
  
  return files;
}

/**
 * Check if a path is a book page
 */
export function isBookPage(path: string): boolean {
  return path.startsWith('books/') && path.includes('/chapters/');
}

/**
 * Get book page data from path
 */
export async function getBookPageFromPath(path: string): Promise<{ book: BookDocument; page: BookPage } | null> {
  const books = await getBookDocuments();
  
  for (const book of books) {
    const page = book.pages.find(p => 
      p.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, '') === path
    );
    if (page) {
      return { book, page };
    }
  }
  
  return null;
}

