import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";
import { getPayload } from 'payload';
import config from '@/payload.config';

// Helper to safely create URL from environment variable
function getMetadataBase(): URL {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (siteUrl && siteUrl.trim() !== '') {
    const cleanUrl = siteUrl.split(/[PAYLOAD_]/)[0].trim().replace(/^['"]|['"]$/g, '');
    if (cleanUrl) {
      try {
        return new URL(cleanUrl);
      } catch (e) {
        console.warn(`Invalid NEXT_PUBLIC_SITE_URL: ${cleanUrl}, using default`);
      }
    }
  }
  return new URL('https://magicborn.b2gdevs.com');
}

export async function generateMetadata(): Promise<Metadata> {
  let seo = {
    metaTitle: "Magicborn: Mordred's Legacy - Spell Crafting Game",
    metaDescription: "A deterministic, progression-heavy spell crafting game. No character levels—all power comes from crafting spells from runes.",
    keywords: "magicborn, rpg, fantasy, spellcrafting, dark fantasy",
    ogImage: "/images/new_tarro.webp",
    ogType: "website" as const,
    twitterCard: "summary_large_image" as const,
    twitterSite: "",
  };

  try {
    const payload = await getPayload({ config });
    const sidebarConfig = await payload.findGlobal({ slug: 'sidebar-config' });
    if (sidebarConfig?.seo) {
      seo = { ...seo, ...(sidebarConfig.seo as typeof seo) };
    }
  } catch (e) {
    // Use defaults
  }

  return {
    metadataBase: getMetadataBase(),
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords?.split(',').map(k => k.trim()),
    authors: [{ name: "B2Gdevs" }],
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: seo.ogType as "website" | "article",
      url: "https://magicborn.b2gdevs.com",
      siteName: "Magicborn: Mordred's Legacy",
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: seo.twitterCard as "summary" | "summary_large_image",
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [seo.ogImage] : [],
      site: seo.twitterSite || undefined,
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
}

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
        <body className="text-text-primary">
          <ClientLayout>{children}</ClientLayout>
        </body>
      </html>
    );
  }
