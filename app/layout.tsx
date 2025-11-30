import "./globals.css";
import type { ReactNode } from "react";
import TopNav from "@components/TopNav";
import { GameProviders } from "./GameProviders";

export const metadata = {
  title: "Rune Crafter",
  description: "Language-driven crafting prototype"
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <body className="bg-slate-950 text-slate-100">
          <GameProviders>
            <TopNav />
            <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
          </GameProviders>
        </body>
      </html>
    );
  }