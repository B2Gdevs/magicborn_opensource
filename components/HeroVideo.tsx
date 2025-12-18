"use client";

import { useEffect, useState, useRef } from "react";
import type { HeroVideoConfig } from "@lib/config/videos";
import { getAllHeroVideos } from "@lib/config/videos";

interface HeroVideoProps {
  video?: HeroVideoConfig;
  children: React.ReactNode;
  fallbackImage?: string;
  loopVideos?: boolean;
  videoUrls?: string[]; // Override video sources from CMS
}

export default function HeroVideo({ video, children, fallbackImage, loopVideos = true, videoUrls }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const defaultVideos = getAllHeroVideos();
  
  // Use CMS video URLs if provided, otherwise fall back to defaults
  const allVideos: HeroVideoConfig[] = videoUrls?.length 
    ? videoUrls.map(src => ({ src, thumbnail: '' }))
    : defaultVideos;
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/design/images/new_tarro.webp";

  // Handle video end - switch to next video in loop
  const handleEnded = () => {
    if (loopVideos && allVideos.length > 1) {
      const nextIndex = (currentVideoIndex + 1) % allVideos.length;
      setCurrentVideoIndex(nextIndex);
      setIsReady(false);
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isMounted = true;

    const handleCanPlay = () => {
      if (isMounted) {
        setIsReady(true);
        videoElement.play().catch((err) => {
          console.warn("Autoplay prevented:", err);
        });
      }
    };

    const handlePlaying = () => {
      if (isMounted) {
        setIsReady(true);
      }
    };

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1 && isMounted) {
        setIsReady(false);
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
      }
    };

    const handleError = (e: Event) => {
      console.error("Video error:", e);
    };

    // Set video source
    if (videoElement.src !== currentVideo.src) {
      setIsReady(false);
      videoElement.src = currentVideo.src;
      videoElement.load();
    }

    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.preload = "auto";

    // Try to play if already loaded
    if (videoElement.readyState >= 3) {
      videoElement.play().catch(() => {
        // Autoplay prevented
      });
    }

    return () => {
      isMounted = false;
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        key={currentVideo.src}
        autoPlay
        muted
        playsInline
        loop={!loopVideos || allVideos.length === 1}
        preload="auto"
        poster={imageFallback}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: isReady ? 1 : 0 }}
      >
        <source src={currentVideo.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback image - shows until video is ready */}
      {!isReady && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center z-10"
          style={{ 
            backgroundImage: `url(${imageFallback})`,
            zIndex: 1
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
