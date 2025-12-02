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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];

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

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1) {
        // Move to next video in loop
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
        setIsLoaded(false);
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
      setHasError(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    // Update video source when currentVideo changes
    if (videoElement.src !== currentVideo.src) {
      videoElement.src = currentVideo.src;
      videoElement.load();
    }

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length]);

  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      {!hasError && (
        <video
          ref={videoRef}
          key={currentVideo.src}
          autoPlay
          loop={!loopVideos || allVideos.length === 1}
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isLoaded && isPlaying ? "opacity-100" : "opacity-0"
          }`}
          aria-label={currentVideo.title}
        >
          <source src={currentVideo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Image */}
      {(hasError || (!isLoaded && !isPlaying)) && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${imageFallback})` }}
          aria-label={currentVideo.title}
        />
      )}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
