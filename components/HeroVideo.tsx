"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroVideoConfig } from "@lib/config/videos";
import { getAllHeroVideos } from "@lib/config/videos";

interface HeroVideoProps {
  video?: HeroVideoConfig;
  children: React.ReactNode;
  fallbackImage?: string;
  loopVideos?: boolean;
}

export default function HeroVideo({ video, children, fallbackImage, loopVideos = true }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isMounted = true;

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1 && isMounted) {
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
    };

    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    // Update video source when index changes
    if (videoElement.src !== currentVideo.src) {
      videoElement.src = currentVideo.src;
      videoElement.load();
      videoElement.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }

    return () => {
      isMounted = false;
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video with poster - browser handles the transition natively */}
      <video
        ref={videoRef}
        key={currentVideo.src}
        autoPlay
        loop={!loopVideos || allVideos.length === 1}
        muted
        playsInline
        preload="auto"
        poster={imageFallback}
        className="absolute inset-0 w-full h-full object-cover"
        aria-label={currentVideo.title}
      >
        <source src={currentVideo.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
