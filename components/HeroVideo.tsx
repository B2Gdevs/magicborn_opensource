"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import type { HeroVideoConfig } from "@lib/config/videos";
import { getAllHeroVideos } from "@lib/config/videos";

interface HeroVideoProps {
  video?: HeroVideoConfig;
  children: React.ReactNode;
  fallbackImage?: string;
  loopVideos?: boolean;
}

export default function HeroVideo({ video, children, fallbackImage, loopVideos = true }: HeroVideoProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  // Handle video end - switch to next video in loop
  const handleEnded = () => {
    if (loopVideos && allVideos.length > 1) {
      const nextIndex = (currentVideoIndex + 1) % allVideos.length;
      setCurrentVideoIndex(nextIndex);
      setIsReady(false);
    }
  };

  // Preload next video
  useEffect(() => {
    if (!loopVideos || allVideos.length <= 1) return;

    const nextIndex = (currentVideoIndex + 1) % allVideos.length;
    const nextVideo = allVideos[nextIndex];
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'video';
    preloadLink.href = nextVideo.src;
    document.head.appendChild(preloadLink);

    return () => {
      if (document.head.contains(preloadLink)) {
        document.head.removeChild(preloadLink);
      }
    };
  }, [currentVideoIndex, loopVideos, allVideos]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* React Player - handles all video loading smoothly */}
      <div className="absolute inset-0 w-full h-full">
        <ReactPlayer
          key={currentVideo.src}
          url={currentVideo.src}
          playing={true}
          loop={!loopVideos || allVideos.length === 1}
          muted={true}
          playsinline={true}
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          onReady={() => setIsReady(true)}
          onEnded={handleEnded}
          onError={(error: unknown) => {
            console.error("Video error:", error);
          }}
        />
      </div>

      {/* Fallback image - shows until video is ready */}
      {!isReady && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
          style={{ 
            backgroundImage: `url(${imageFallback})`,
          }}
        />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-20" />

      {/* Content */}
      <div className="relative z-30 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
