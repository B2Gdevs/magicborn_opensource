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
  const imageRef = useRef<HTMLImageElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  // Wait for image to load first
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(true); // Still proceed even if image fails
    };
    img.src = imageFallback;
  }, [imageFallback]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !imageLoaded) return;

    let isMounted = true;
    let transitionTimeout: NodeJS.Timeout | null = null;

    // Set video source immediately
    if (videoElement.src !== currentVideo.src) {
      videoElement.src = currentVideo.src;
      videoElement.load();
      setShowVideo(false);
    }

    const handleCanPlayThrough = () => {
      if (!isMounted || showVideo) return;
      
      videoElement.play()
        .then(() => {
          if (isMounted && !showVideo) {
            // Wait for video to actually be playing
            transitionTimeout = setTimeout(() => {
              if (isMounted) {
                setShowVideo(true);
              }
            }, 200);
          }
        })
        .catch((error) => {
          console.warn("Autoplay prevented:", error);
          if (isMounted && !showVideo) {
            setShowVideo(true);
          }
        });
    };

    const handlePlaying = () => {
      if (isMounted && !showVideo) {
        // Clear any pending timeout
        if (transitionTimeout) {
          clearTimeout(transitionTimeout);
        }
        setShowVideo(true);
      }
    };

    const handleEnded = () => {
      if (loopVideos && allVideos.length > 1) {
        const nextIndex = (currentVideoIndex + 1) % allVideos.length;
        setCurrentVideoIndex(nextIndex);
        setShowVideo(false);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
      if (isMounted) {
        setHasError(true);
      }
    };

    videoElement.addEventListener("canplaythrough", handleCanPlayThrough, { once: true });
    videoElement.addEventListener("playing", handlePlaying, { once: true });
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    videoElement.preload = "auto";
    videoElement.muted = true;
    videoElement.playsInline = true;

    // Check if already loaded
    if (videoElement.readyState >= 4) {
      handleCanPlayThrough();
    }

    return () => {
      isMounted = false;
      if (transitionTimeout) {
        clearTimeout(transitionTimeout);
      }
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length, imageLoaded, showVideo]);

  // Don't render until image is loaded
  if (!imageLoaded) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Fallback Image - Always visible first, fades out when video is ready */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          showVideo && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ zIndex: showVideo && !hasError ? 0 : 1 }}
      >
        <img
          ref={imageRef}
          src={imageFallback}
          alt={currentVideo.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: 'block' }}
        />
      </div>

      {/* Video Background - Hidden until ready, then fades in */}
      {!hasError && (
        <video
          ref={videoRef}
          key={currentVideo.src}
          autoPlay
          loop={!loopVideos || allVideos.length === 1}
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ zIndex: showVideo ? 1 : 0 }}
          aria-label={currentVideo.title}
        >
          <source src={currentVideo.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
