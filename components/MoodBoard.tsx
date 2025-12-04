"use client";

import { useState } from "react";
import Masonry from "react-masonry-css";
import { motion, AnimatePresence } from "framer-motion";
import type { ExtractedImage } from "@lib/utils/image-extractor";

interface MoodBoardProps {
  images: ExtractedImage[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MoodBoard({ images, isOpen, onClose }: MoodBoardProps) {
  const [selectedImage, setSelectedImage] = useState<ExtractedImage | null>(null);

  const breakpointColumns = {
    default: 4,
    1920: 5,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mood Board Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-shadow border-t-2 border-border shadow-2xl"
            style={{ maxHeight: "80vh" }}
          >
            <div className="h-full overflow-y-auto documentation-scroll-area">
              <div className="container mx-auto px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-glow">Mood Board</h2>
                    <p className="text-sm text-text-muted mt-1">
                      {images.length} {images.length === 1 ? "image" : "images"} from this document
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-ember-glow transition-colors p-2 rounded-lg hover:bg-deep"
                    aria-label="Close mood board"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Masonry Grid */}
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="masonry-grid"
                  columnClassName="masonry-grid_column"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={`${image.src}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="mb-4 cursor-pointer group"
                      onClick={() => setSelectedImage(image)}
                    >
                      <div className="relative rounded-lg border border-border overflow-hidden bg-shadow hover:border-ember-glow transition-all">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {image.alt && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-sm text-white font-medium">{image.alt}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </Masonry>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-void/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 bg-ember border-2 border-ember-glow text-white p-2 rounded-lg hover:bg-ember-glow transition-colors"
                aria-label="Close image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg border-2 border-border"
              />
              {selectedImage.alt && (
                <div className="mt-4 text-center">
                  <p className="text-lg text-text-primary">{selectedImage.alt}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

