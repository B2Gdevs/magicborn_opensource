/**
 * Video configuration for hero sections
 * Add videos here to make them available throughout the app
 */
export interface HeroVideoConfig {
  id: string;
  src: string;
  title: string;
  description: string;
  thumbnail?: string; // For SEO and fallback
}

export const HERO_VIDEOS: HeroVideoConfig[] = [
  {
    id: "new_tarro_teaser",
    src: "design/videos/new_tarro_teaser.mp4",
    title: "Magicborn: Mordred's Legacy - Tarro Teaser",
    description: "A glimpse into the shadowy world of Magicborn where spellcrafters forge their destiny",
    thumbnail: "/design/images/new_tarro.webp",
  },
  {
    id: "new_tarro_destroyed_teaser",
    src: "design/videos/new_tarro_destroyed_teaser.mp4",
    title: "Magicborn: Modred's Legacy - Tarro Destroyed",
    description: "The shadowy depths where Modred's legacy lives on",
    thumbnail: "/design/images/new_tarro.webp",
  },
  // Add more videos here as you create them
];

export function getHeroVideo(id: string): HeroVideoConfig | undefined {
  return HERO_VIDEOS.find(v => v.id === id);
}

export function getRandomHeroVideo(): HeroVideoConfig {
  return HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
}

export function getAllHeroVideos(): HeroVideoConfig[] {
  return HERO_VIDEOS;
}
