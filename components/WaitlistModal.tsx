"use client";

import { useEffect, useRef } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedCode?: string | null;
}

export default function WaitlistModal({ isOpen, onClose, embedCode }: WaitlistModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[420px] max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {embedCode ? (
          <div dangerouslySetInnerHTML={{ __html: embedCode }} />
        ) : (
          <div className="p-8 text-center text-text-secondary">
            <p>Waitlist form not configured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
