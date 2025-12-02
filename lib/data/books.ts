/**
 * Book data structure for multi-chapter books with pages
 * Supports chapter/page structure with images
 */

export interface BookPage {
  chapterNumber: number; // 0 for prologue, 1, 2, 3, etc.
  chapterName: string; // "prologue", "chapter-1-morgana", etc.
  pageNumber: number; // Page number in the book (1, 2, 3...)
  fileName: string; // The markdown filename
  contentPath: string; // Full path to markdown file
  imagePath?: string; // Path to corresponding image (chXX-pYYY.png)
  title?: string; // Extracted from filename or content
}

export interface BookChapter {
  chapterNumber: number;
  chapterName: string;
  displayName: string; // "Prologue", "Chapter 1: Morgana", etc.
  pages: BookPage[];
}

export interface BookData {
  id: string;
  title: string;
  description: string;
  basePath: string; // e.g., "/books/mordreds_tale"
  chapters: BookChapter[];
  totalPages: number;
}

/**
 * Parse page filename to extract page number
 * Examples: "001-page-1.md" -> 1, "002-page-13.md" -> 13
 */
function extractPageNumber(fileName: string): number {
  const match = fileName.match(/page-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get image path for a page
 * Format: chXX-pYYY.png where XX is chapter (00, 01, etc.) and YYY is page (001, 002, etc.)
 */
function getImagePath(basePath: string, chapterNumber: number, pageNumber: number): string {
  const chapterStr = chapterNumber.toString().padStart(2, '0');
  const pageStr = pageNumber.toString().padStart(3, '0');
  return `${basePath}/images/ch${chapterStr}-p${pageStr}.png`;
}

/**
 * Load book structure from the file system
 * This will be populated dynamically, but for now we'll define the structure
 */
export function getMordredsTaleBook(): BookData {
  const basePath = "/books/mordreds_tale";
  
  // Define chapters based on the folder structure
  const chapters: BookChapter[] = [
    {
      chapterNumber: 0,
      chapterName: "prologue",
      displayName: "Prologue",
      pages: Array.from({ length: 11 }, (_, i) => {
        const pageNum = i + 1;
        const fileName = `${String(pageNum).padStart(3, '0')}-page-${pageNum}.md`;
        return {
          chapterNumber: 0,
          chapterName: "prologue",
          pageNumber: pageNum,
          fileName,
          contentPath: `${basePath}/chapters/00-prologue/${fileName}`,
          imagePath: getImagePath(basePath, 0, pageNum),
        };
      }),
    },
    {
      chapterNumber: 1,
      chapterName: "chapter-1-morgana",
      displayName: "Chapter 1: Morgana",
      pages: Array.from({ length: 20 }, (_, i) => {
        const pageNum = i + 12; // Pages 12-31
        const fileName = `${String(i + 1).padStart(3, '0')}-page-${pageNum}-${getPageSlug(pageNum)}.md`;
        return {
          chapterNumber: 1,
          chapterName: "chapter-1-morgana",
          pageNumber: pageNum,
          fileName: getActualFileName(1, i + 1),
          contentPath: `${basePath}/chapters/01-chapter-1-morgana/${getActualFileName(1, i + 1)}`,
          imagePath: getImagePath(basePath, 1, i + 1), // Image page numbers start at 1 for each chapter
        };
      }),
    },
    {
      chapterNumber: 2,
      chapterName: "chapter-2-jack",
      displayName: "Chapter 2: Jack",
      pages: Array.from({ length: 39 }, (_, i) => {
        const pageNum = i + 32; // Pages 32-70
        return {
          chapterNumber: 2,
          chapterName: "chapter-2-jack",
          pageNumber: pageNum,
          fileName: getActualFileName(2, i + 1),
          contentPath: `${basePath}/chapters/02-chapter-2-jack/${getActualFileName(2, i + 1)}`,
          imagePath: getImagePath(basePath, 2, i + 1),
        };
      }),
    },
    {
      chapterNumber: 3,
      chapterName: "chapter-3-morgana-imprisoned",
      displayName: "Chapter 3: Morgana Imprisoned",
      pages: [
        {
          chapterNumber: 3,
          chapterName: "chapter-3-morgana-imprisoned",
          pageNumber: 72,
          fileName: "001-page-72-the-changed-world.md",
          contentPath: `${basePath}/chapters/03-chapter-3-morgana-imprisoned/001-page-72-the-changed-world.md`,
          imagePath: getImagePath(basePath, 3, 1),
        },
      ],
    },
  ];

  // Helper to get actual filenames (simplified - in production, scan the directory)
  function getActualFileName(chapter: number, index: number): string {
    // This is a placeholder - in a real implementation, we'd scan the directory
    // For now, return a pattern that matches the structure
    const chapterFiles: Record<number, string[]> = {
      1: [
        "001-page-12-morgana-s-immaculate-birth.md",
        "002-page-13-the-birth-of-morgana-s-descendants.md",
        "003-page-14-morgana-s-child-and-resolve.md",
        "004-page-15-the-morgana-encounter-s-a-goblin.md",
        "005-page-16-the-gallery-of-echoes.md",
        "006-page-17-chamber-of-entwined-relics-part-1.md",
        "007-page-18-chamber-of-entwined-relics-part-2.md",
        "008-page-19-echoes-of-splendor.md",
        "009-page-20-pilgrims-of-dust.md",
        "010-page-21-the-predator-emerges.md",
        "011-page-22-the-weakness-revealed.md",
        "012-page-23-the-child-s-cry.md",
        "013-page-24-the-beast-and-the-mother.md",
        "014-page-25-the-broken-silence.md",
        "015-page-26-the-weight-of-the-hall.md",
        "016-page-27-the-seal.md",
        "017-page-28-breaking-the-gate.md",
        "018-page-29-into-the-light.md",
        "019-page-30-unfamiliar-truths.md",
        "020-page-31-toward-the-council.md",
      ],
      2: [
        "001-page-32-the-leak.md",
        "002-page-33-the-list.md",
        "003-page-34-the-knock.md",
        "004-page-35-the-weight.md",
        "005-page-36-the-street-of-shadows.md",
        "006-page-38-the-empty-barrel.md",
        "007-page-38-trinkets-and-bones.md",
        "008-page-39-jack-s-turn.md",
        "009-page-40-losing-street.md",
        "010-page-41-the-back-room.md",
        "011-page-42-the-relic-of-maliphant.md",
        "012-page-43-the-old-man-s-story.md",
        "013-page-44-the-price-paid.md",
        "014-page-45-proving-it-real.md",
        "015-page-46-jack-s-questions.md",
        "016-page-47-the-crew-s-trade.md",
        "017-page-48-the-value-of-hope.md",
        "018-page-49-bringing-jack-in.md",
        "019-page-50-the-lair-s-trade.md",
        "020-page-51-invitation-in-the-storm.md",
        "021-page-52-the-guard-problem.md",
        "022-page-53-the-send-off.md",
        "023-page-54-accounting.md",
        "024-page-55-worth.md",
        "025-page-56-the-snap.md",
        "026-page-57-what-he-d-done.md",
        "027-page-58-flight.md",
        "028-page-59-sanctuary.md",
        "029-page-60-discovery.md",
        "030-page-61-judgment.md",
        "031-page-62-into-the-dark.md",
        "032-page-63-the-first-level.md",
        "033-page-64-deeper.md",
        "034-page-65-the-beast.md",
        "035-page-66-the-living-quarters.md",
        "036-page-67-morgana.md",
        "037-page-69-night-of-sleeping-beauty.md",
        "038-page-70-weeks-in-the-dark.md",
        "039-page-71-magic-found.md",
      ],
    };
    
    if (chapterFiles[chapter] && chapterFiles[chapter][index - 1]) {
      return chapterFiles[chapter][index - 1];
    }
    return `${String(index).padStart(3, '0')}-page-${index}.md`;
  }

  function getPageSlug(pageNum: number): string {
    return "page";
  }

  const totalPages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0);

  return {
    id: "tale_of_modred",
    title: "The Tale of Modred",
    description: "The prequel to Modred's Legacy. The origin story of Modred the Shadow-Weaver and how he discovered the true power of runes.",
    basePath,
    chapters,
    totalPages,
  };
}

/**
 * Get all pages in order for a book
 */
export function getAllPages(book: BookData): BookPage[] {
  return book.chapters.flatMap((chapter) => chapter.pages);
}

/**
 * Get page by page number
 */
export function getPageByNumber(book: BookData, pageNumber: number): BookPage | undefined {
  return getAllPages(book).find((page) => page.pageNumber === pageNumber);
}

/**
 * Get next/previous page
 */
export function getNextPage(book: BookData, currentPageNumber: number): BookPage | null {
  const allPages = getAllPages(book);
  const currentIndex = allPages.findIndex((p) => p.pageNumber === currentPageNumber);
  return currentIndex >= 0 && currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;
}

export function getPreviousPage(book: BookData, currentPageNumber: number): BookPage | null {
  const allPages = getAllPages(book);
  const currentIndex = allPages.findIndex((p) => p.pageNumber === currentPageNumber);
  return currentIndex > 0 ? allPages[currentIndex - 1] : null;
}

