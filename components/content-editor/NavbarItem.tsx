// components/content-editor/NavbarItem.tsx
// Navbar item with hover popup

"use client";

import { useState, useRef, ReactNode } from "react";
import { NavbarPopup } from "./NavbarPopup";

interface NavbarItemProps {
  icon: ReactNode;
  label?: string;
  isActive?: boolean;
  popupContent?: ReactNode;
  popupAlign?: "left" | "center" | "right";
  onClick?: () => void;
  className?: string;
}

export function NavbarItem({
  icon,
  label,
  isActive = false,
  popupContent,
  popupAlign = "left",
  onClick,
  className = "",
}: NavbarItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={itemRef}
        onMouseEnter={() => popupContent && setIsHovered(true)}
        onMouseLeave={() => {
          // Small delay to allow moving to popup
          setTimeout(() => setIsHovered(false), 100);
        }}
        onClick={onClick}
        className={`
          flex items-center justify-center
          w-10 h-10
          rounded-lg
          transition-all
          ${isActive 
            ? "bg-white/10 text-white" 
            : "text-text-secondary hover:text-white hover:bg-white/5"
          }
          ${className}
        `}
        title={label}
      >
        {icon}
      </button>
      {popupContent && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <NavbarPopup
            isOpen={isHovered}
            onClose={() => setIsHovered(false)}
            triggerRef={itemRef}
            align={popupAlign}
          >
            {popupContent}
          </NavbarPopup>
        </div>
      )}
    </div>
  );
}

