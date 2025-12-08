import { ReactNode } from "react";

// Shared layout for all documentation routes
// This ensures the DocumentationViewer component persists across navigation
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

