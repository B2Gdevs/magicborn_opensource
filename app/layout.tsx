import "./globals.css";
import type { ReactNode } from "react";
import TopNav from "@components/TopNav";
import { GameProviders } from "./GameProviders";

export const metadata = {
  title: "Magicborn - Spell Crafting Game",
  description: "A deterministic, progression-heavy spell crafting game. No character levels—all power comes from crafting spells, building affinity, and evolving magic."
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <body className="bg-slate-950 text-slate-100">
          <GameProviders>
            <TopNav />
            {children}
          </GameProviders>
        </body>
      </html>
    );
  }