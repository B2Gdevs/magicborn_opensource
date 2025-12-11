// app/openwebui/page.tsx
// Dedicated page for OpenWebUI chat interface

import OpenWebUIChat from "@components/ai-stack/OpenWebUIChat";

export const metadata = {
  title: "Magicborn Assistant - OpenWebUI | Magicborn",
  description: "Chat with the Magicborn Assistant using OpenWebUI, powered by your project's documentation and knowledge base",
};

export default function OpenWebUIPage() {
  return (
    <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
      <OpenWebUIChat showManagementLink={true} />
    </main>
  );
}

