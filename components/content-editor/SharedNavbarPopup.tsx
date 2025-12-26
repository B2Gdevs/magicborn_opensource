// components/content-editor/SharedNavbarPopup.tsx
// Shared popup container that positions relative to a container element

"use client";

import { ReactNode, useEffect, useRef, useState, type RefObject } from "react";

interface SharedNavbarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement>;
  containerRef?: RefObject<HTMLElement>; // Ref to the container to match width/position
  padding?: number; // Padding on left/right (default: 0.5rem = 8px)
}

export function SharedNavbarPopup({ 
  isOpen, 
  onClose, 
  children, 
  triggerRef,
  containerRef,
  padding = 8, // 0.5rem default
}: SharedNavbarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; width: number } | null>(null);

  // Calculate position based on container
  useEffect(() => {
    if (!isOpen || !containerRef?.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      setPosition({
        left: rect.left - padding,
        width: rect.width + (padding * 2),
      });
    };

    updatePosition();
    
    // Update on resize/scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, containerRef, padding]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        (!triggerRef || (triggerRef.current && !triggerRef.current.contains(e.target as Node)))
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // If containerRef is provided, use calculated position; otherwise center
  const style = position
    ? {
        top: "64px",
        left: `${position.left}px`,
        width: `${position.width}px`,
        boxSizing: "content-box" as const,
      }
    : {
        top: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        minWidth: "320px",
        maxWidth: "480px",
        boxSizing: "content-box" as const,
      };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-deep/95 backdrop-blur-md border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
      style={{
        ...style,
        height: "500px",
      }}
    >
      {children}
    </div>
  );
}

