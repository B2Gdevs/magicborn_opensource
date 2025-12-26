// components/content-editor/NavbarPopup.tsx
// Reusable popup component that appears below navbar items on hover

"use client";

import { ReactNode, useRef, useEffect } from "react";

interface NavbarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  triggerRef: React.RefObject<HTMLElement>;
  align?: "left" | "center" | "right";
}

export function NavbarPopup({ isOpen, onClose, children, triggerRef, align = "left" }: NavbarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
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

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !popupRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popup = popupRef.current;
      if (!trigger || !popup) return;

      const rect = trigger.getBoundingClientRect();
      const navbarHeight = 56; // Approximate navbar height

      // Position popup below the navbar, aligned with trigger
      popup.style.position = "fixed";
      popup.style.top = `${navbarHeight + 8}px`;
      
      if (align === "center") {
        popup.style.left = `${rect.left + rect.width / 2 - popup.offsetWidth / 2}px`;
      } else if (align === "right") {
        popup.style.left = `${rect.right - popup.offsetWidth}px`;
      } else {
        popup.style.left = `${rect.left}px`;
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isOpen, triggerRef, align]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-deep/95 backdrop-blur-md border border-border rounded-lg shadow-2xl min-w-[200px] max-h-[400px] overflow-y-auto"
    >
      {children}
    </div>
  );
}

