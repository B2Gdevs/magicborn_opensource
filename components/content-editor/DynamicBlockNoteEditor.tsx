// components/content-editor/DynamicBlockNoteEditor.tsx
// Dynamic wrapper to ensure BlockNote is only imported/rendered on the client (Next.js)

"use client";

import dynamic from "next/dynamic";

export const BlockNoteEditor = dynamic(() => import("./BlockNoteEditor"), {
  ssr: false,
});




