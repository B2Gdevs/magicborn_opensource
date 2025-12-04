// Documentation file loader and organizer

export interface DocFile {
  name: string;
  path: string;
  category: string;
  isDirectory: boolean;
  children?: DocFile[];
}

export interface DocCategory {
  name: string;
  files: DocFile[];
  subcategories: DocCategory[];
}

export async function loadDocumentationList(): Promise<DocFile[]> {
  try {
    const response = await fetch('/api/docs/list');
    if (!response.ok) {
      throw new Error('Failed to load documentation list');
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Error loading documentation list:', error);
    return [];
  }
}

export async function loadDocumentationFile(path: string): Promise<string> {
  try {
    // Handle both with and without .md extension
    const filePath = path.endsWith('.md') ? path : `${path}.md`;
    const response = await fetch(`/design/${filePath}`);
    if (!response.ok) {
      throw new Error(`Failed to load documentation file: ${filePath}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading documentation file:', error);
    throw error;
  }
}

export function organizeByCategory(files: DocFile[]): DocCategory[] {
  const categories: Map<string, DocCategory> = new Map();

  function processFile(file: DocFile) {
    if (file.isDirectory && file.children) {
      // It's a directory - create a category for it
      const categoryName = file.name;
      
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          name: categoryName,
          files: [],
          subcategories: [],
        });
      }
      
      const category = categories.get(categoryName)!;
      
      // Process children
      file.children.forEach(child => {
        if (child.isDirectory) {
          // Add as subcategory
          const subcategory: DocCategory = {
            name: child.name,
            files: [],
            subcategories: [],
          };
          if (child.children) {
            child.children.forEach(subFile => {
              if (!subFile.isDirectory) {
                subcategory.files.push(subFile);
              } else {
                // Nested subcategory
                const nestedSub: DocCategory = {
                  name: subFile.name,
                  files: [],
                  subcategories: [],
                };
                if (subFile.children) {
                  subFile.children.forEach(nestedFile => {
                    if (!nestedFile.isDirectory) {
                      nestedSub.files.push(nestedFile);
                    }
                  });
                }
                subcategory.subcategories.push(nestedSub);
              }
            });
          }
          category.subcategories.push(subcategory);
        } else {
          // It's a file in this category
          category.files.push(child);
        }
      });
    } else if (!file.isDirectory) {
      // It's a file in the root/main category
      const categoryName = file.category || 'main';
      
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          name: categoryName,
          files: [],
          subcategories: [],
        });
      }
      categories.get(categoryName)!.files.push(file);
    }
  }

  files.forEach(file => processFile(file));

  // Sort categories and their contents
  return Array.from(categories.values())
    .sort((a, b) => {
      // Main category first
      if (a.name === 'main') return -1;
      if (b.name === 'main') return 1;
      return a.name.localeCompare(b.name);
    })
    .map(category => ({
      ...category,
      files: category.files.sort((a, b) => a.name.localeCompare(b.name)),
      subcategories: category.subcategories.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function getDefaultDocument(files: DocFile[]): string | null {
  // Look for overall_concept_design_guide.md first
  function findDoc(files: DocFile[], targetName: string): string | null {
    for (const file of files) {
      if (file.isDirectory && file.children) {
        const found = findDoc(file.children, targetName);
        if (found) return found;
      } else if (!file.isDirectory) {
        if (file.name === targetName || file.path === targetName || file.path.includes(targetName)) {
          return file.path;
        }
      }
    }
    return null;
  }
  
  // Try to find the main design guide
  const mainDoc = findDoc(files, 'overall_concept_design_guide');
  if (mainDoc) return mainDoc;
  
  // Fallback: find first markdown file
  function findFirstMd(files: DocFile[]): string | null {
    for (const file of files) {
      if (file.isDirectory && file.children) {
        const found = findFirstMd(file.children);
        if (found) return found;
      } else if (!file.isDirectory) {
        return file.path;
      }
    }
    return null;
  }
  
  return findFirstMd(files);
}

