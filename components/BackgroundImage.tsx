"use client";

import Image from "next/image";

interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  overlay?: "dark" | "light" | "none";
  children?: React.ReactNode;
}

export function BackgroundImage({ 
  src, 
  alt = "Background", 
  className = "",
  overlay = "dark",
  children 
}: BackgroundImageProps) {
  const overlayClasses = {
    dark: "bg-gradient-to-b from-void/90 via-void/70 to-void/95",
    light: "bg-gradient-to-b from-void/50 via-void/30 to-void/60",
    none: "",
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        quality={90}
      />
      {overlay !== "none" && (
        <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      )}
      {/* Organic glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ember/10 via-transparent to-shadow-purple/10" />
      </div>
      {children && (
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      )}
    </div>
  );
}
