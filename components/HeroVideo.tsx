"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set video source immediately
    if (videoElement.src !== currentVideo.src) {
      videoElement.src = currentVideo.src;
      videoElement.load();
    }

    const handleLoadedData = () => {
      setIsVideoReady(true);
      // Try to play, but don't wait for it to show the video
      videoElement.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn("Autoplay prevented:", error);
          // Still show video even if autoplay fails
          setIsVideoReady(true);
        });
    };

    const handleCanPlayThrough = () => {
      setIsVideoReady(true);
      if (!isPlaying) {
        videoElement.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Video is ready even if autoplay fails
            setIsVideoReady(true);
          });
      }
    };

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1) {
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
        setIsVideoReady(false);
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
      setHasError(true);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    // Preload the video
    videoElement.preload = "auto";
    videoElement.muted = true;
    videoElement.playsInline = true;

    return () => {
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length, isPlaying]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fallback Image - Always visible, fades out when video is ready */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
          isVideoReady && isPlaying ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={imageFallback}
          alt={currentVideo.title}
          fill
          priority
          className="object-cover"
          quality={90}
        />
      </div>

      {/* Video Background - Fades in when ready */}
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
            isVideoReady && isPlaying ? "opacity-100" : "opacity-0"
          }`}
          aria-label={currentVideo.title}
        >
          <source src={currentVideo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
