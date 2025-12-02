"use client";

import { BackgroundImage } from "./BackgroundImage";

interface TarroBackgroundProps {
  children?: React.ReactNode;
  overlay?: "dark" | "light" | "none";
  className?: string;
}

/**
 * Reusable component using the flagship new_tarro.webp image as background
 * Use this throughout the app for consistent visual identity
 */
export function TarroBackground({ 
  children, 
  overlay = "dark",
  className = ""
}: TarroBackgroundProps) {
  return (
    <BackgroundImage
      src="/images/new_tarro.webp"
      alt="Tarro - Magicborn flagship image"
      overlay={overlay}
      className={className}
    >
      {children}
    </BackgroundImage>
  );
}

