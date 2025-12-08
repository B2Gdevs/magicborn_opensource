import { ReactNode } from "react";

// Shared layout for all book routes
// This ensures the DocumentationViewer component persists across navigation
export default function BooksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

