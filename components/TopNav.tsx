"use client";

import { useEffect, useState } from "react";
import { PlayerLocalRepo } from "@pkg/repo/localRepo";
import type { Player } from "@core/types";
import WaitlistModal from "./WaitlistModal";

const repo = new PlayerLocalRepo();

interface SiteFeatures {
  showWaitlistButton?: boolean;
  waitlistUrl?: string;
  waitlistEmbedCode?: string;
}

export default function TopNav() {
  const [active, setActive] = useState<Player | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [features, setFeatures] = useState<SiteFeatures | null>(null);

  useEffect(() => {
    setActive(repo.getActive());
    const onStorage = () => setActive(repo.getActive());
    window.addEventListener("storage", onStorage);

    // Fetch site config for waitlist visibility
    fetch("/api/payload/globals/site-config")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.features) {
          setFeatures(data.features);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const showWaitlist = features?.showWaitlistButton ?? false;

  return (
    <>
      <header className="fixed top-0 right-0 left-64 h-16 z-30">
        <div className="h-full flex items-center justify-end px-6 gap-4">
          {active && (
            <span className="text-sm text-text-secondary">
              Active: <span className="text-ember-glow font-bold">{active.name}</span>
            </span>
          )}
          {showWaitlist && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full font-bold text-sm bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Join Waitlist
            </button>
          )}
        </div>
      </header>
      <WaitlistModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        embedCode={features?.waitlistEmbedCode}
      />
    </>
  );
}
