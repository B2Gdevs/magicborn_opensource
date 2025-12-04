"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DocumentationViewer, { ViewerMode } from "@components/DocumentationViewer";
import { getBookById, getPageByNumber } from "@/lib/utils/book-scanner";

export default function StoriesPage() {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get("page");
  const bookParam = searchParams.get("book") || "mordreds_tale"; // Default to first book
  const initialPage = useMemo(() => (pageParam ? parseInt(pageParam, 10) : 1), [pageParam]);
  
  const [initialPath, setInitialPath] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    async function loadInitialPath() {
      const book = await getBookById(bookParam);
      if (!book) return;
      
      if (pageParam) {
        const page = getPageByNumber(book, initialPage);
        if (page) {
          setInitialPath(page.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, ''));
          return;
        }
      }
      // Default to first page of the book
      const firstPage = getPageByNumber(book, 1);
      if (firstPage) {
        setInitialPath(firstPage.contentPath.replace(/^\/books\//, 'books/').replace(/\.md$/, ''));
      }
    }
    loadInitialPath();
  }, [bookParam, initialPage, pageParam]);

  return (
    <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary">
      <div className="h-full flex flex-col">
        <DocumentationViewer initialPath={initialPath} mode={ViewerMode.BOOKS} />
      </div>
    </main>
  );
}
