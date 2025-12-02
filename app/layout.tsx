import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import TopNav from "@components/TopNav";
import { GameProviders } from "./GameProviders";

export const metadata: Metadata = {
  title: "Magicborn: Modred's Legacy - Spell Crafting Game",
  description: "A deterministic, progression-heavy spell crafting game. No character levels—all power comes from crafting spells from runes (A-Z), building elemental affinity, mastering rune familiarity, and evolving magic through Modred's Legacy. Features deterministic combat, spell evolution, raids, and a shadowy, organic dark fantasy world.",
  keywords: [
    "spell crafting game",
    "rune magic",
    "deterministic combat",
    "spell evolution",
    "elemental affinity",
    "dark fantasy game",
    "modred's legacy",
    "magicborn",
    "spellcraft",
    "rune system",
    "progression game",
    "no levels game"
  ],
  authors: [{ name: "B2Gdevs" }],
  openGraph: {
    title: "Magicborn: Modred's Legacy",
    description: "A deterministic, progression-heavy spell crafting game. Craft spells from runes, build affinity, master familiarity, and evolve your magic.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magicborn: Modred's Legacy",
    description: "A deterministic spell crafting game with no character levels—all power from crafting and evolution.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <head>
          <link rel="canonical" href="https://magicborn.b2gdevs.com" />
        </head>
        <body className="bg-void text-text-primary">
          <GameProviders>
            <TopNav />
            {children}
          </GameProviders>
        </body>
      </html>
    );
  }
