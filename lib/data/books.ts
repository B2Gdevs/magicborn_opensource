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
 * Get image path for a page
 * Format: chXX-pYYY.png where XX is chapter (00, 01, etc.) and YYY is page within chapter (001, 002, etc.)
 * Note: Images are numbered per chapter, not globally
 */
function getImagePath(basePath: string, chapterNumber: number, pageInChapter: number): string {
  const chapterStr = chapterNumber.toString().padStart(2, '0');
  const pageStr = pageInChapter.toString().padStart(3, '0');
  return `${basePath}/images/ch${chapterStr}-p${pageStr}.png`;
}

/**
 * Load book structure for The Tale of Modred
 */
export function getMordredsTaleBook(): BookData {
  const basePath = "/books/mordreds_tale";
  
  // Define chapters with all pages explicitly mapped
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
      pages: [
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 12, fileName: "001-page-12-morgana-s-immaculate-birth.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/001-page-12-morgana-s-immaculate-birth.md`, imagePath: getImagePath(basePath, 1, 1) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 13, fileName: "002-page-13-the-birth-of-morgana-s-descendants.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/002-page-13-the-birth-of-morgana-s-descendants.md`, imagePath: getImagePath(basePath, 1, 2) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 14, fileName: "003-page-14-morgana-s-child-and-resolve.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/003-page-14-morgana-s-child-and-resolve.md`, imagePath: getImagePath(basePath, 1, 3) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 15, fileName: "004-page-15-the-morgana-encounter-s-a-goblin.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/004-page-15-the-morgana-encounter-s-a-goblin.md`, imagePath: getImagePath(basePath, 1, 4) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 16, fileName: "005-page-16-the-gallery-of-echoes.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/005-page-16-the-gallery-of-echoes.md`, imagePath: getImagePath(basePath, 1, 5) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 17, fileName: "006-page-17-chamber-of-entwined-relics-part-1.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/006-page-17-chamber-of-entwined-relics-part-1.md`, imagePath: getImagePath(basePath, 1, 6) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 18, fileName: "007-page-18-chamber-of-entwined-relics-part-2.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/007-page-18-chamber-of-entwined-relics-part-2.md`, imagePath: getImagePath(basePath, 1, 7) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 19, fileName: "008-page-19-echoes-of-splendor.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/008-page-19-echoes-of-splendor.md`, imagePath: getImagePath(basePath, 1, 8) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 20, fileName: "009-page-20-pilgrims-of-dust.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/009-page-20-pilgrims-of-dust.md`, imagePath: getImagePath(basePath, 1, 9) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 21, fileName: "010-page-21-the-predator-emerges.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/010-page-21-the-predator-emerges.md`, imagePath: getImagePath(basePath, 1, 10) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 22, fileName: "011-page-22-the-weakness-revealed.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/011-page-22-the-weakness-revealed.md`, imagePath: getImagePath(basePath, 1, 11) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 23, fileName: "012-page-23-the-child-s-cry.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/012-page-23-the-child-s-cry.md`, imagePath: getImagePath(basePath, 1, 12) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 24, fileName: "013-page-24-the-beast-and-the-mother.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/013-page-24-the-beast-and-the-mother.md`, imagePath: getImagePath(basePath, 1, 13) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 25, fileName: "014-page-25-the-broken-silence.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/014-page-25-the-broken-silence.md`, imagePath: getImagePath(basePath, 1, 14) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 26, fileName: "015-page-26-the-weight-of-the-hall.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/015-page-26-the-weight-of-the-hall.md`, imagePath: getImagePath(basePath, 1, 15) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 27, fileName: "016-page-27-the-seal.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/016-page-27-the-seal.md`, imagePath: getImagePath(basePath, 1, 16) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 28, fileName: "017-page-28-breaking-the-gate.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/017-page-28-breaking-the-gate.md`, imagePath: getImagePath(basePath, 1, 17) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 29, fileName: "018-page-29-into-the-light.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/018-page-29-into-the-light.md`, imagePath: getImagePath(basePath, 1, 18) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 30, fileName: "019-page-30-unfamiliar-truths.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/019-page-30-unfamiliar-truths.md`, imagePath: getImagePath(basePath, 1, 19) },
        { chapterNumber: 1, chapterName: "chapter-1-morgana", pageNumber: 31, fileName: "020-page-31-toward-the-council.md", contentPath: `${basePath}/chapters/01-chapter-1-morgana/020-page-31-toward-the-council.md`, imagePath: getImagePath(basePath, 1, 20) },
      ],
    },
    {
      chapterNumber: 2,
      chapterName: "chapter-2-jack",
      displayName: "Chapter 2: Jack",
      pages: [
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 32, fileName: "001-page-32-the-leak.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/001-page-32-the-leak.md`, imagePath: getImagePath(basePath, 2, 1) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 33, fileName: "002-page-33-the-list.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/002-page-33-the-list.md`, imagePath: getImagePath(basePath, 2, 2) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 34, fileName: "003-page-34-the-knock.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/003-page-34-the-knock.md`, imagePath: getImagePath(basePath, 2, 3) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 35, fileName: "004-page-35-the-weight.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/004-page-35-the-weight.md`, imagePath: getImagePath(basePath, 2, 4) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 36, fileName: "005-page-36-the-street-of-shadows.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/005-page-36-the-street-of-shadows.md`, imagePath: getImagePath(basePath, 2, 5) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 38, fileName: "006-page-38-the-empty-barrel.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/006-page-38-the-empty-barrel.md`, imagePath: getImagePath(basePath, 2, 6) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 38, fileName: "007-page-38-trinkets-and-bones.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/007-page-38-trinkets-and-bones.md`, imagePath: getImagePath(basePath, 2, 7) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 39, fileName: "008-page-39-jack-s-turn.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/008-page-39-jack-s-turn.md`, imagePath: getImagePath(basePath, 2, 8) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 40, fileName: "009-page-40-losing-streak.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/009-page-40-losing-streak.md`, imagePath: getImagePath(basePath, 2, 9) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 41, fileName: "010-page-41-the-back-room.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/010-page-41-the-back-room.md`, imagePath: getImagePath(basePath, 2, 10) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 42, fileName: "011-page-42-the-relic-of-maliphant.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/011-page-42-the-relic-of-maliphant.md`, imagePath: getImagePath(basePath, 2, 11) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 43, fileName: "012-page-43-the-old-man-s-story.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/012-page-43-the-old-man-s-story.md`, imagePath: getImagePath(basePath, 2, 12) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 44, fileName: "013-page-44-the-price-paid.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/013-page-44-the-price-paid.md`, imagePath: getImagePath(basePath, 2, 13) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 45, fileName: "014-page-45-proving-it-real.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/014-page-45-proving-it-real.md`, imagePath: getImagePath(basePath, 2, 14) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 46, fileName: "015-page-46-jack-s-questions.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/015-page-46-jack-s-questions.md`, imagePath: getImagePath(basePath, 2, 15) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 47, fileName: "016-page-47-the-crew-s-trade.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/016-page-47-the-crew-s-trade.md`, imagePath: getImagePath(basePath, 2, 16) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 48, fileName: "017-page-48-the-value-of-hope.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/017-page-48-the-value-of-hope.md`, imagePath: getImagePath(basePath, 2, 17) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 49, fileName: "018-page-49-bringing-jack-in.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/018-page-49-bringing-jack-in.md`, imagePath: getImagePath(basePath, 2, 18) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 50, fileName: "019-page-50-the-lair-s-trade.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/019-page-50-the-lair-s-trade.md`, imagePath: getImagePath(basePath, 2, 19) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 51, fileName: "020-page-51-invitation-in-the-storm.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/020-page-51-invitation-in-the-storm.md`, imagePath: getImagePath(basePath, 2, 20) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 52, fileName: "021-page-52-the-guard-problem.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/021-page-52-the-guard-problem.md`, imagePath: getImagePath(basePath, 2, 21) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 53, fileName: "022-page-53-the-send-off.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/022-page-53-the-send-off.md`, imagePath: getImagePath(basePath, 2, 22) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 54, fileName: "023-page-54-accounting.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/023-page-54-accounting.md`, imagePath: getImagePath(basePath, 2, 23) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 55, fileName: "024-page-55-worth.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/024-page-55-worth.md`, imagePath: getImagePath(basePath, 2, 24) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 56, fileName: "025-page-56-the-snap.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/025-page-56-the-snap.md`, imagePath: getImagePath(basePath, 2, 25) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 57, fileName: "026-page-57-what-he-d-done.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/026-page-57-what-he-d-done.md`, imagePath: getImagePath(basePath, 2, 26) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 58, fileName: "027-page-58-flight.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/027-page-58-flight.md`, imagePath: getImagePath(basePath, 2, 27) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 59, fileName: "028-page-59-sanctuary.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/028-page-59-sanctuary.md`, imagePath: getImagePath(basePath, 2, 28) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 60, fileName: "029-page-60-discovery.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/029-page-60-discovery.md`, imagePath: getImagePath(basePath, 2, 29) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 61, fileName: "030-page-61-judgment.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/030-page-61-judgment.md`, imagePath: getImagePath(basePath, 2, 30) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 62, fileName: "031-page-62-into-the-dark.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/031-page-62-into-the-dark.md`, imagePath: getImagePath(basePath, 2, 31) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 63, fileName: "032-page-63-the-first-level.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/032-page-63-the-first-level.md`, imagePath: getImagePath(basePath, 2, 32) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 64, fileName: "033-page-64-deeper.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/033-page-64-deeper.md`, imagePath: getImagePath(basePath, 2, 33) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 65, fileName: "034-page-65-the-beast.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/034-page-65-the-beast.md`, imagePath: getImagePath(basePath, 2, 34) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 66, fileName: "035-page-66-the-living-quarters.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/035-page-66-the-living-quarters.md`, imagePath: getImagePath(basePath, 2, 35) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 67, fileName: "036-page-67-morgana.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/036-page-67-morgana.md`, imagePath: getImagePath(basePath, 2, 36) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 69, fileName: "037-page-69-night-of-sleeping-beauty.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/037-page-69-night-of-sleeping-beauty.md`, imagePath: getImagePath(basePath, 2, 37) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 70, fileName: "038-page-70-weeks-in-the-dark.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/038-page-70-weeks-in-the-dark.md`, imagePath: getImagePath(basePath, 2, 38) },
        { chapterNumber: 2, chapterName: "chapter-2-jack", pageNumber: 71, fileName: "039-page-71-magic-found.md", contentPath: `${basePath}/chapters/02-chapter-2-jack/039-page-71-magic-found.md`, imagePath: getImagePath(basePath, 2, 39) },
      ],
    },
    {
      chapterNumber: 3,
      chapterName: "chapter-3-morgana-imprisoned",
      displayName: "Chapter 3: Morgana Imprisoned",
      pages: [
        { chapterNumber: 3, chapterName: "chapter-3-morgana-imprisoned", pageNumber: 72, fileName: "001-page-72-the-changed-world.md", contentPath: `${basePath}/chapters/03-chapter-3-morgana-imprisoned/001-page-72-the-changed-world.md`, imagePath: getImagePath(basePath, 3, 1) },
      ],
    },
  ];

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
