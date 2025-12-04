import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export interface DocFile {
  name: string;
  path: string;
  category: string;
  isDirectory: boolean;
  children?: DocFile[];
}

function formatName(name: string): string {
  // Format snake_case to Title Case
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function scanDirectory(dirPath: string, basePath: string = ""): Promise<DocFile[]> {
  const items: DocFile[] = [];
  
  if (!existsSync(dirPath)) {
    return items;
  }
  
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and directories
      if (entry.name.startsWith('.')) {
        continue;
      }
      
      const fullPath = join(dirPath, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        const children = await scanDirectory(fullPath, relativePath);
        // Only include directory if it has markdown files or subdirectories with content
        const hasContent = children.some(c => !c.isDirectory || (c.children && c.children.length > 0));
        if (hasContent) {
          // Format book folder names (top-level in books/)
          const displayName = basePath === 'books' ? formatName(entry.name) : entry.name;
          items.push({
            name: displayName,
            path: relativePath,
            category: basePath || entry.name,
            isDirectory: true,
            children: children.filter(c => !c.isDirectory || (c.children && c.children.length > 0)),
          });
        }
      } else if (entry.name.endsWith('.md')) {
        items.push({
          name: entry.name.replace('.md', ''),
          path: relativePath.replace('.md', ''),
          category: basePath || 'main',
          isDirectory: false,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return items.sort((a, b) => {
    // Directories first, then files
    if (a.isDirectory !== b.isDirectory) {
      return a.isDirectory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export async function GET() {
  try {
    const publicPath = join(process.cwd(), 'public');
    const allFiles: DocFile[] = [];
    
    // Scan design folder
    const designPath = join(publicPath, 'design');
    if (existsSync(designPath)) {
      const designFiles = await scanDirectory(designPath, 'design');
      allFiles.push(...designFiles);
    }
    
    // Scan books folder
    const booksPath = join(publicPath, 'books');
    if (existsSync(booksPath)) {
      const booksFiles = await scanDirectory(booksPath, 'books');
      allFiles.push(...booksFiles);
    }
    
    return NextResponse.json({ files: allFiles });
  } catch (error) {
    console.error('Error listing documentation files:', error);
    return NextResponse.json(
      { error: 'Failed to list documentation files', files: [] },
      { status: 500 }
    );
  }
}

