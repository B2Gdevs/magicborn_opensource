import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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

function getImagePath(basePath: string, chapterNumber: number, pageInChapter: number): string {
  const chapterStr = chapterNumber.toString().padStart(2, '0');
  const pageStr = pageInChapter.toString().padStart(3, '0');
  return `${basePath}/images/ch${chapterStr}-p${pageStr}.png`;
}

function parseChapterFolder(folderName: string): { chapterNumber: number; chapterName: string; displayName: string } | null {
  // Format: "00-prologue", "01-chapter-1-morgana", etc.
  const match = folderName.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  
  const chapterNum = parseInt(match[1], 10);
  const name = match[2];
  
  // Generate display name
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

async function scanBookFolder(bookId: string, bookPath: string): Promise<ScannedBook | null> {
  const chaptersPath = join(bookPath, 'chapters');
  const storiesPath = join(bookPath, 'images');
  const storiesFolderPath = join(bookPath, 'stories');
  
  const chapters: ScannedBook['chapters'] = [];
  const stories: ScannedBook['stories'] = [];
  
  // Scan chapters
  if (existsSync(chaptersPath)) {
    const chapterFolders = await readdir(chaptersPath, { withFileTypes: true });
    const sortedChapters = chapterFolders
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => {
        const parsed = parseChapterFolder(entry.name);
        if (!parsed) return null;
        return { ...parsed, folderName: entry.name };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
    
    for (const chapter of sortedChapters) {
      const chapterPath = join(chaptersPath, chapter.folderName);
      const files = await readdir(chapterPath);
      const mdFiles = files
        .filter(f => f.endsWith('.md'))
        .sort(); // Sort alphabetically (should be numbered)
      
      const pages = mdFiles.map((fileName, index) => {
        // Try to extract page number from filename (e.g., "001-page-1.md" -> 1)
        const pageMatch = fileName.match(/(\d+)/);
        const pageNum = pageMatch ? parseInt(pageMatch[1], 10) : index + 1;
        
        return {
          chapterNumber: chapter.chapterNumber,
          chapterName: chapter.chapterName,
          pageNumber: pageNum,
          fileName,
          contentPath: `/books/${bookId}/chapters/${chapter.folderName}/${fileName}`,
          imagePath: getImagePath(`/books/${bookId}`, chapter.chapterNumber, index + 1),
        };
      });
      
      if (pages.length > 0) {
        chapters.push({
          chapterNumber: chapter.chapterNumber,
          chapterName: chapter.chapterName,
          displayName: chapter.displayName,
          pages,
        });
      }
    }
  }
  
  // Scan stories
  if (existsSync(storiesFolderPath)) {
    const storyFiles = await readdir(storiesFolderPath);
    const mdStories = storyFiles.filter(f => f.endsWith('.md'));
    
    for (const storyFile of mdStories) {
      const storyId = storyFile.replace('.md', '');
      stories.push({
        id: storyId,
        title: storyId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        path: `books/${bookId}/stories/${storyId}`,
      });
    }
  }
  
  const totalPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);
  
  // Generate book title from folder name
  const title = bookId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
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

export async function GET() {
  try {
    const publicPath = join(process.cwd(), 'public', 'books');
    
    if (!existsSync(publicPath)) {
      return NextResponse.json({ books: [] });
    }
    
    const bookFolders = await readdir(publicPath, { withFileTypes: true });
    const books: ScannedBook[] = [];
    
    for (const entry of bookFolders) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const bookPath = join(publicPath, entry.name);
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

