// components/ui/Skeleton.tsx
// Reusable skeleton component with subtle shimmer effect
// Matches content layout for better perceived performance

"use client";

import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = "rectangular",
  width,
  height 
}: SkeletonProps) {
  const baseStyles = "skeleton-shimmer rounded";
  
  const variantStyles = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  );
}

