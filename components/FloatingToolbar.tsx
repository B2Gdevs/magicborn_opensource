"use client";

import { motion } from "framer-motion";
import type { ExtractedImage } from "@lib/utils/image-extractor";

interface FloatingToolbarProps {
  imageCount: number;
  isMoodBoardOpen: boolean;
  onToggleMoodBoard: () => void;
}

export default function FloatingToolbar({
  imageCount,
  isMoodBoardOpen,
  onToggleMoodBoard,
}: FloatingToolbarProps) {
  if (imageCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <button
        onClick={onToggleMoodBoard}
        className={`
          flex items-center gap-3 px-6 py-4 rounded-lg font-semibold
          transition-all shadow-lg
          ${
            isMoodBoardOpen
              ? "bg-ember text-white border-2 border-ember-glow"
              : "bg-shadow text-text-primary border-2 border-border hover:border-ember-glow hover:bg-deep"
          }
        `}
        aria-label={isMoodBoardOpen ? "Close mood board" : "Open mood board"}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Mood Board</span>
        {imageCount > 0 && (
          <span
            className={`
              px-2 py-1 rounded-full text-xs font-bold
              ${
                isMoodBoardOpen
                  ? "bg-white/20 text-white"
                  : "bg-ember text-white"
              }
            `}
          >
            {imageCount}
          </span>
        )}
      </button>
    </motion.div>
  );
}

