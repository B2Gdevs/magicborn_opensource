import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";

// Helper to safely create URL from environment variable
function getMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Validate and use provided URL
  if (siteUrl && siteUrl.trim() !== '') {
    // Clean up the URL - remove any concatenated values after the URL
    const cleanUrl = siteUrl.split(/[PAYLOAD_]/)[0].trim();
    
    // Remove quotes if present
    const unquotedUrl = cleanUrl.replace(/^['"]|['"]$/g, '');
    
    if (unquotedUrl && unquotedUrl !== '') {
      try {
        return new URL(unquotedUrl);
      } catch (e) {
        console.warn(`Invalid NEXT_PUBLIC_SITE_URL: ${unquotedUrl}, using default`);
      }
    }
  }
  
  // Default fallback
  return new URL('https://magicborn.b2gdevs.com');
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Magicborn: Mordred's Legacy - Spell Crafting Game",
  description: "A deterministic, progression-heavy spell crafting game. No character levels—all power comes from crafting spells from runes (A-Z), building elemental affinity, mastering rune familiarity, and evolving magic through Mordred's Legacy. Features deterministic combat, spell evolution, raids, and a shadowy, organic dark fantasy world.",
  keywords: [
    "spell crafting game",
    "rune magic",
    "deterministic combat",
    "spell evolution",
    "elemental affinity",
    "dark fantasy game",
    "mordred's legacy",
    "magicborn",
    "spellcraft",
    "rune system",
    "progression game",
    "no levels game",
    "spell crafting",
    "magic game",
    "rune based magic",
    "deterministic gameplay"
  ],
  authors: [{ name: "B2Gdevs" }],
  openGraph: {
    title: "Magicborn: Mordred's Legacy",
    description: "A deterministic, progression-heavy spell crafting game. Craft spells from runes, build affinity, master familiarity, and evolve your magic.",
    type: "website",
    url: "https://magicborn.b2gdevs.com",
    siteName: "Magicborn: Mordred's Legacy",
    images: [
      {
        url: "/images/new_tarro.webp",
        width: 1200,
        height: 630,
        alt: "Magicborn: Mordred's Legacy - Tarro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magicborn: Mordred's Legacy",
    description: "A deterministic spell crafting game with no character levels—all power from crafting and evolution.",
    images: ["/images/new_tarro.webp"],
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
  other: {
    "og:video": "/videos/new_tarro_teaser.mp4",
    "og:video:type": "video/mp4",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <head>
          <link rel="canonical" href="https://magicborn.b2gdevs.com" />
          {/* ConvertKit Form Script */}
          <script src="https://f.convertkit.com/ckjs/ck.5.js"></script>
          {/* Structured Data for Video SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VideoGame",
                "name": "Magicborn: Mordred's Legacy",
                "description": "A deterministic, progression-heavy spell crafting game with no character levels. All power comes from crafting spells, building affinity, and evolving magic.",
                "genre": ["Spell Crafting", "RPG", "Strategy", "Dark Fantasy"],
                "gamePlatform": "Web Browser",
                "applicationCategory": "Game",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "trailer": {
                  "@type": "VideoObject",
                  "name": "Magicborn: Mordred's Legacy - Tarro Teaser",
                  "description": "A glimpse into the shadowy world of Magicborn where spellcrafters forge their destiny",
                  "thumbnailUrl": "https://magicborn.b2gdevs.com/images/new_tarro.webp",
                  "uploadDate": "2024-12-01",
                  "contentUrl": "https://magicborn.b2gdevs.com/videos/new_tarro_teaser.mp4",
                  "embedUrl": "https://magicborn.b2gdevs.com"
                },
                "screenshot": {
                  "@type": "ImageObject",
                  "url": "https://magicborn.b2gdevs.com/images/new_tarro.webp",
                  "width": 1200,
                  "height": 630
                }
              })
            }}
          />
        </head>
        <body className="bg-void text-text-primary">
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    );
  }
