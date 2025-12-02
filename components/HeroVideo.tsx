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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  // Preload next video
  useEffect(() => {
    if (!loopVideos || allVideos.length <= 1) return;

    const nextIndex = (currentVideoIndex + 1) % allVideos.length;
    const nextVideo = allVideos[nextIndex];
    const preloadVideo = document.createElement('video');
    preloadVideo.src = nextVideo.src;
    preloadVideo.preload = 'auto';
    preloadVideo.muted = true;

    return () => {
      preloadVideo.src = '';
    };
  }, [currentVideoIndex, loopVideos, allVideos]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isMounted = true;

    const handleLoadedData = () => {
      if (isMounted) {
        setIsVideoReady(true);
      }
    };

    const handleCanPlayThrough = () => {
      if (isMounted) {
        setIsVideoReady(true);
        // Ensure video plays
        videoElement.play().catch(() => {
          // Autoplay prevented, but video is ready
        });
      }
    };

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1 && isMounted) {
        setIsVideoReady(false);
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
    };

    // Set video source
    if (videoElement.src !== currentVideo.src) {
      setIsVideoReady(false);
      videoElement.src = currentVideo.src;
      videoElement.load();
    }

    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    videoElement.preload = "auto";
    videoElement.muted = true;
    videoElement.playsInline = true;

    // Try to play immediately
    if (videoElement.readyState >= 3) {
      videoElement.play().catch(() => {
        // Autoplay prevented
      });
    }

    return () => {
      isMounted = false;
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough);
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
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isVideoReady ? "opacity-100" : "opacity-0"
        }`}
        style={{ 
          willChange: 'opacity',
          backfaceVisibility: 'hidden'
        }}
        aria-label={currentVideo.title}
        onLoadedData={() => setIsVideoReady(true)}
        onCanPlayThrough={() => setIsVideoReady(true)}
      >
        <source src={currentVideo.src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback image - shows when video isn't ready */}
      {!isVideoReady && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${imageFallback})`,
            zIndex: 1
          }}
        />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
