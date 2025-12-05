"use client";

import { useState } from "react";
import { MagicbornContentEditor, type EditorType } from "@components/MagicbornContentEditor";

export default function DevelopmentPage() {
  const [activeTab, setActiveTab] = useState<EditorType>("files");

  return (
    <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
      <MagicbornContentEditor activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
