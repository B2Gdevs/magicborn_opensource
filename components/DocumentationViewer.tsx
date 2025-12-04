"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateTableOfContents, processMarkdownContent, slugify, type TocItem } from "@lib/utils/markdown-parser";
import { 
  loadDocumentationList, 
  loadDocumentationFile, 
  organizeByCategory,
  getDefaultDocument,
  type DocFile,
  type DocCategory 
} from "@lib/utils/docs-loader";

interface DocumentationViewerProps {
  initialPath?: string;
}

export default function DocumentationViewer({ initialPath }: DocumentationViewerProps) {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [activeSection, setActiveSection] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDoc, setCurrentDoc] = useState<string>("");
  const [docFiles, setDocFiles] = useState<DocFile[]>([]);
  const [categories, setCategories] = useState<DocCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Load documentation structure
  useEffect(() => {
    async function loadDocs() {
      try {
        const files = await loadDocumentationList();
        setDocFiles(files);
        const organized = organizeByCategory(files);
        setCategories(organized);
        
        // Expand all categories by default
        const allCategoryNames = new Set<string>();
        organized.forEach(cat => {
          allCategoryNames.add(cat.name);
          cat.subcategories.forEach(sub => allCategoryNames.add(`${cat.name}/${sub.name}`));
        });
        setExpandedCategories(allCategoryNames);
        
        // Load default or initial document
        const docPath = initialPath || getDefaultDocument(files);
        if (docPath) {
          await loadDocument(docPath);
        }
      } catch (error) {
        console.error("Failed to load documentation:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [initialPath]);

  const loadDocument = async (path: string) => {
    try {
      setLoading(true);
      const content = await loadDocumentationFile(path);
      setCurrentDoc(path);
      const processed = processMarkdownContent(content);
      setMarkdownContent(processed);
      const generatedToc = generateTableOfContents(content);
      setToc(generatedToc);
    } catch (error) {
      console.error("Failed to load document:", error);
      setMarkdownContent("# Error\n\nFailed to load document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll("h1, h2, h3, h4");
      let current = "";

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          current = heading.id;
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [markdownContent]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  const toggleCategory = (categoryPath: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryPath)) {
      newExpanded.delete(categoryPath);
    } else {
      newExpanded.add(categoryPath);
    }
    setExpandedCategories(newExpanded);
  };

  const renderTocItem = (item: TocItem, depth = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className={depth > 0 ? "ml-4" : ""}>
        <button
          onClick={() => scrollToSection(item.id)}
          className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
            isActive
              ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
              : "text-text-secondary hover:text-ember-glow hover:bg-deep"
          }`}
        >
          {item.title}
        </button>
        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderTocItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: DocCategory, parentPath = "") => {
    const categoryPath = parentPath ? `${parentPath}/${category.name}` : category.name;
    const isExpanded = expandedCategories.has(categoryPath);
    const hasContent = category.files.length > 0 || category.subcategories.length > 0;

    if (!hasContent) return null;

    return (
      <div key={categoryPath} className="mb-4">
        <button
          onClick={() => toggleCategory(categoryPath)}
          className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-semibold text-glow hover:bg-deep rounded-lg transition-colors"
        >
          <span className="capitalize">{category.name}</span>
          <span className="text-text-muted">{isExpanded ? "▼" : "▶"}</span>
        </button>
        
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1">
            {category.files.map((file) => {
              const isActive = currentDoc === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => loadDocument(file.path)}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                    isActive
                      ? "text-ember-glow bg-shadow border-l-2 border-ember-glow"
                      : "text-text-secondary hover:text-ember-glow hover:bg-deep"
                  }`}
                >
                  {file.name}
                </button>
              );
            })}
            {category.subcategories.map((sub) => renderCategory(sub, categoryPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside
        className={`${
          isSidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r border-border bg-shadow flex-shrink-0 relative h-full`}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-glow">Documentation</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-text-muted hover:text-ember-glow transition-colors p-1"
                aria-label="Collapse sidebar"
              >
                ←
              </button>
            </div>

            {/* Document Navigation */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                Documents
              </h3>
              <div className="space-y-1">
                {categories.map((category) => renderCategory(category))}
              </div>
            </div>

            {/* Table of Contents for Current Document */}
            {toc.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Contents
                </h3>
                <nav className="space-y-1">
                  {toc.map((item) => renderTocItem(item))}
                </nav>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-void relative h-full">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4 z-50 bg-ember border-2 border-ember-glow text-white p-3 rounded-lg shadow-lg hover:shadow-ember-glow/50 transition-all"
            aria-label="Open sidebar"
          >
            →
          </button>
        )}
        <div className="max-w-4xl mx-auto px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-text-muted">Loading document...</p>
            </div>
          ) : (
            <article className="documentation-content max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h1 id={id} className="text-4xl font-bold text-white mt-12 mb-8" {...props} />;
                  },
                  h2: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h2 id={id} className="text-3xl font-bold text-glow mt-12 mb-8 border-b border-border pb-4" {...props} />;
                  },
                  h3: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h3 id={id} className="text-2xl font-bold text-glow mt-10 mb-6" {...props} />;
                  },
                  h4: ({ node, ...props }: any) => {
                    const id = slugify(String(props.children || ''));
                    return <h4 id={id} className="text-xl font-semibold text-glow mt-8 mb-4" {...props} />;
                  },
                  p: ({ node, ...props }) => <p className="mb-6 leading-relaxed text-text-secondary" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc space-y-2 my-4 ml-6" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal space-y-2 my-4 ml-6" {...props} />,
                  li: ({ node, ...props }) => <li className="text-text-secondary" {...props} />,
                  code: ({ node, inline, ...props }: any) => 
                    inline ? (
                      <code className="bg-shadow border border-border rounded px-2 py-1 text-ember-glow text-sm" {...props} />
                    ) : (
                      <code className="text-text-primary" {...props} />
                    ),
                  pre: ({ node, ...props }) => (
                    <pre className="bg-shadow border border-border rounded-lg p-4 overflow-x-auto my-6" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-ember-glow pl-4 my-6 italic text-text-secondary" {...props} />
                  ),
                  img: ({ node, ...props }: any) => (
                    <figure className="my-8">
                      <img 
                        src={props.src?.startsWith('/') || props.src?.startsWith('http') ? props.src : `/design/${props.src}`}
                        alt={props.alt || ''}
                        className="w-full rounded-lg border border-border shadow-lg"
                        {...props}
                      />
                      {props.alt && (
                        <figcaption className="text-center text-sm text-text-muted mt-2">
                          {props.alt}
                        </figcaption>
                      )}
                    </figure>
                  ),
                  strong: ({ node, ...props }) => <strong className="text-ember-glow font-bold" {...props} />,
                  em: ({ node, ...props }) => <em className="text-text-glow italic" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8 border-border" {...props} />,
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </main>
    </div>
  );
}
