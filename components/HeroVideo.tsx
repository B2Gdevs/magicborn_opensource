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
  const [showVideo, setShowVideo] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const allVideos = getAllHeroVideos();
  const currentVideo = video || allVideos[currentVideoIndex];
  const imageFallback = fallbackImage || currentVideo.thumbnail || "/images/new_tarro.webp";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    let isMounted = true;

    // Set video source immediately
    if (videoElement.src !== currentVideo.src) {
      videoElement.src = currentVideo.src;
      videoElement.load();
      setShowVideo(false); // Reset when video source changes
    }

    const handleCanPlayThrough = () => {
      if (!isMounted) return;
      // Video is fully loaded and can play through
      videoElement.play()
        .then(() => {
          if (isMounted) {
            // Small delay to ensure video is actually playing before showing it
            setTimeout(() => {
              if (isMounted) {
                setShowVideo(true);
              }
            }, 100);
          }
        })
        .catch((error) => {
          console.warn("Autoplay prevented:", error);
          // Still show video even if autoplay fails (user can interact)
          if (isMounted) {
            setShowVideo(true);
          }
        });
    };

    const handlePlaying = () => {
      if (isMounted) {
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

    // Use canplaythrough for better reliability
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("ended", handleEnded);
    videoElement.addEventListener("error", handleError);

    // Preload the video
    videoElement.preload = "auto";
    videoElement.muted = true;
    videoElement.playsInline = true;

    // If video is already loaded, trigger canplaythrough
    if (videoElement.readyState >= 3) {
      handleCanPlayThrough();
    }

    return () => {
      isMounted = false;
      videoElement.removeEventListener("canplaythrough", handleCanPlayThrough);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("ended", handleEnded);
      videoElement.removeEventListener("error", handleError);
    };
  }, [currentVideo.src, currentVideoIndex, loopVideos, allVideos.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Fallback Image - Always visible first, fades out when video is ready */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          showVideo && !hasError ? "opacity-0" : "opacity-100"
        }`}
        style={{ zIndex: showVideo && !hasError ? 0 : 1 }}
      >
        <Image
          src={imageFallback}
          alt={currentVideo.title}
          fill
          priority
          className="object-cover"
          quality={90}
          unoptimized={false}
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
            showVideo ? "opacity-100" : "opacity-0"
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
