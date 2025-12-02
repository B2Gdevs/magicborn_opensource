"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroVideoConfig } from "@lib/config/videos";

interface HeroVideoProps {
  video: HeroVideoConfig;
  children: React.ReactNode;
  fallbackImage?: string;
}

export default function HeroVideo({ video, children, fallbackImage }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      videoElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn("Autoplay prevented:", error);
          setHasError(true);
        });
    };

    const handleError = () => {
      console.error("Video failed to load");
      setHasError(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    // Try to load the video
    videoElement.load();

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [video.src]);

  const imageFallback = fallbackImage || video.thumbnail || "/images/new_tarro.webp";

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      {!hasError && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded && isPlaying ? "opacity-100" : "opacity-0"
          }`}
          aria-label={video.title}
        >
          <source src={video.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Image */}
      {(hasError || (!isLoaded && !isPlaying)) && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${imageFallback})` }}
          aria-label={video.title}
        />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/60 to-void/90" />

      {/* Organic glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ember/20 via-transparent to-shadow-purple/20" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ember/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-shadow-purple/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
