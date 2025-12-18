import fs from 'fs';
import path from 'path';

const developerDocsDirectory = path.join(process.cwd(), 'public/developer');

export interface DocMeta {
  title: string;
  slug: string;
  description?: string;
  path: string;
  isDirectory: boolean;
  children?: DocMeta[];
}

export interface DocContent {
  meta: DocMeta;
  content: string;
  headings: { id: string; text: string; level: number }[];
}

// Extract title from markdown content
function extractTitle(content: string, filename: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1];
  return filename.replace(/\.md$/, '').replace(/-/g, ' ').replace(/_/g, ' ');
}

// Extract description (first paragraph after title)
function extractDescription(content: string): string | undefined {
  const withoutTitle = content.replace(/^#\s+.+$/m, '').trim();
  const match = withoutTitle.match(/^([^\n#]+)/m);
  return match ? match[1].trim().substring(0, 160) : undefined;
}

// Extract headings for table of contents
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[*_`]/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    headings.push({ id, text, level });
  }
  
  return headings;
}

// Recursively get all docs from directory
function walkDirectory(dir: string, basePath: string = ''): DocMeta[] {
  if (!fs.existsSync(dir)) return [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const docs: DocMeta[] = [];
  
  for (const entry of entries) {
    // Skip images folder and hidden files
    if (entry.name === 'images' || entry.name.startsWith('.')) continue;
    
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      const children = walkDirectory(fullPath, relativePath);
      // Check for index/README in folder
      const indexFile = children.find(c => 
        c.slug.endsWith('/README') || c.slug.endsWith('/index')
      );
      
      docs.push({
        title: entry.name.replace(/-/g, ' ').replace(/_/g, ' '),
        slug: relativePath,
        path: relativePath,
        isDirectory: true,
        children: children.filter(c => c !== indexFile),
      });
    } else if (entry.name.endsWith('.md')) {
      const slug = relativePath.replace(/\.md$/, '');
      const content = fs.readFileSync(fullPath, 'utf8');
      const title = extractTitle(content, entry.name);
      const description = extractDescription(content);
      
      docs.push({
        title,
        slug,
        description,
        path: relativePath,
        isDirectory: false,
      });
    }
  }
  
  // Sort: directories first, then files alphabetically
  return docs.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    // README first
    if (a.slug.endsWith('README')) return -1;
    if (b.slug.endsWith('README')) return 1;
    return a.title.localeCompare(b.title);
  });
}

// Get all developer docs organized
export function getAllDeveloperDocs(): DocMeta[] {
  return walkDirectory(developerDocsDirectory);
}

// Get a single doc by slug
export function getDeveloperDocBySlug(slug: string): DocContent | null {
  const filePath = path.join(developerDocsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    // Try with index.md or README.md for directories
    const dirPath = path.join(developerDocsDirectory, slug);
    if (fs.existsSync(path.join(dirPath, 'README.md'))) {
      return getDeveloperDocBySlug(`${slug}/README`);
    }
    if (fs.existsSync(path.join(dirPath, 'index.md'))) {
      return getDeveloperDocBySlug(`${slug}/index`);
    }
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const title = extractTitle(content, path.basename(filePath));
  const description = extractDescription(content);
  const headings = extractHeadings(content);
  
  return {
    meta: {
      title,
      slug,
      description,
      path: `${slug}.md`,
      isDirectory: false,
    },
    content,
    headings,
  };
}

// Get flat list of all doc slugs for static generation
export function getAllDeveloperDocSlugs(): string[] {
  const slugs: string[] = [];
  
  function collectSlugs(docs: DocMeta[]) {
    for (const doc of docs) {
      if (!doc.isDirectory) {
        slugs.push(doc.slug);
      }
      if (doc.children) {
        collectSlugs(doc.children);
      }
    }
  }
  
  collectSlugs(getAllDeveloperDocs());
  return slugs;
}

// Search index for Cmd+K search
export interface SearchIndexEntry {
  slug: string;
  title: string;
  content: string;
}

export function getSearchIndex(): SearchIndexEntry[] {
  const slugs = getAllDeveloperDocSlugs();
  const index: SearchIndexEntry[] = [];
  
  for (const slug of slugs) {
    const doc = getDeveloperDocBySlug(slug);
    if (doc) {
      // Strip markdown syntax for cleaner search
      const cleanContent = doc.content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '') // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/[#*_~]/g, '') // Remove markdown symbols
        .replace(/\n+/g, ' ') // Collapse newlines
        .trim();
      
      index.push({
        slug: doc.meta.slug,
        title: doc.meta.title,
        content: cleanContent,
      });
    }
  }
  
  return index;
}

