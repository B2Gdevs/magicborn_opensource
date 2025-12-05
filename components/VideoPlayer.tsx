"use client";

import { useState, useRef, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Video player component that only plays when user clicks play
 * Shows a play button overlay until clicked
 */
export default function VideoPlayer({ src, alt, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      setIsLoading(true);
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
        setHasError(true);
        setIsLoading(false);
      });
    }
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <figure className={`my-6 group max-w-2xl mx-auto ${className}`}>
      <div className="relative inline-block w-full rounded-lg border border-border shadow-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-auto max-h-[600px] object-contain block"
          style={{
            maxWidth: "100%",
            display: "block",
            margin: 0,
            padding: 0,
            lineHeight: 0,
          }}
          controls={isPlaying}
          onPlaying={handlePlaying}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          preload="metadata"
        />
        
        {/* Play button overlay - shows when not playing */}
        {!isPlaying && !hasError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/60 transition-all z-10"
            onClick={handlePlay}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlay();
              }
            }}
            aria-label="Play video"
          >
            {isLoading ? (
              <div className="text-white">
                <svg
                  className="animate-spin h-12 w-12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            ) : (
              <div className="text-white">
                <svg
                  className="h-16 w-16 text-ember-glow hover:text-ember transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-text-secondary p-4 text-center">
            <p>Unable to load video</p>
          </div>
        )}
      </div>
      {alt && (
        <figcaption className="text-center text-sm text-text-muted mt-2 italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

