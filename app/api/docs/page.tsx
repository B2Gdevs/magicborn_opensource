// app/api/docs/page.tsx
// Swagger UI documentation page

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(
  () => import("swagger-ui-react"),
  { 
    ssr: false,
    loading: () => (
      <div className="ml-64 mt-16 p-8">
        <div className="text-center">
          <p className="text-text-secondary">Loading API documentation...</p>
        </div>
      </div>
    ),
  }
);

export default function ApiDocsPage() {
  useEffect(() => {
    // Import CSS dynamically to avoid SSR issues
    // @ts-ignore - CSS import doesn't have type definitions
    import("swagger-ui-react/swagger-ui.css").catch(() => {});
  }, []);

  return (
    <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)] bg-white">
      <div className="h-full w-full">
        <SwaggerUI url="/api/docs/openapi.json" />
      </div>
    </main>
  );
}


