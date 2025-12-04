import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * Book structure scanned from file system
 * Scans public/books/ directory for book folders containing chapters and stories
 */
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
 * Format: /books/{bookId}/images/ch{chapterNumber}-p{pageNumber}.png
 * Example: /books/mordreds_tale/images/ch00-p001.png
 */
function getImagePath(bookId: string, chapterNumber: number, pageInChapter: number): string {
  const chapterStr = chapterNumber.toString().padStart(2, '0');
  const pageStr = pageInChapter.toString().padStart(3, '0');
  return `/books/${bookId}/images/ch${chapterStr}-p${pageStr}.png`;
}

/**
 * Parse chapter folder name to extract chapter info
 * Format: "00-prologue", "01-chapter-1-morgana", etc.
 */
function parseChapterFolder(folderName: string): { chapterNumber: number; chapterName: string; displayName: string } | null {
  const match = folderName.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  
  const chapterNum = parseInt(match[1], 10);
  const name = match[2];
  
  // Generate display name from folder name
  let displayName = name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Special case for prologue
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
 * Example: "mordreds_tale" -> "Mordreds Tale"
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
    
    // Parse and sort chapter folders
    const parsedChapters = chapterFolders
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => {
        const parsed = parseChapterFolder(entry.name);
        return parsed ? { ...parsed, folderName: entry.name } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    // Process each chapter folder
    for (const chapterInfo of parsedChapters) {
      const chapterPath = join(chaptersPath, chapterInfo.folderName);
      const files = await readdir(chapterPath);
      
      // Get all markdown files and sort them
      const mdFiles = files
        .filter(f => f.endsWith('.md'))
        .sort();
      
      // Create page entries for each markdown file
      const pages: Page[] = mdFiles.map((fileName, index) => {
        // Page number within chapter (1-indexed)
        const pageInChapter = index + 1;
        
        // Extract page number from filename if possible (e.g., "001-page-12.md" -> 12)
        // Otherwise use the position in the sorted list
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
 * API endpoint to scan all books from public/books/ directory
 * Returns array of ScannedBook objects with chapters, pages, and stories
 */
export async function GET() {
  try {
    const publicBooksPath = join(process.cwd(), 'public', 'books');
    
    if (!existsSync(publicBooksPath)) {
      return NextResponse.json({ books: [] });
    }
    
    const bookFolders = await readdir(publicBooksPath, { withFileTypes: true });
    const books: ScannedBook[] = [];
    
    // Scan each book folder
    for (const entry of bookFolders) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const bookPath = join(publicBooksPath, entry.name);
        const book = await scanBookFolder(entry.name, bookPath);
        if (book) {
          books.push(book);
        }
      }
    }
    
    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error scanning books:', error);
    return NextResponse.json(
      { error: 'Failed to scan books', books: [] },
      { status: 500 }
    );
  }
}
