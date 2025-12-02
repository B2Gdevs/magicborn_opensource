"use client";

import HeroVideo from "@components/HeroVideo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section with Video Background - Full Screen Behind Nav */}
      <div className="fixed inset-0 z-0">
        <HeroVideo loopVideos={true}>
          <div className="container mx-auto px-12 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-7xl md:text-8xl font-bold mb-4 text-white drop-shadow-2xl animate-fade-in">
                Magicborn
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg animate-fade-in-delay">
                <em>Modred's Legacy</em>
              </h2>
              <p className="text-lg md:text-xl text-white/80 mb-4 font-light max-w-2xl mx-auto drop-shadow-lg animate-fade-in-delay-2">
                In the shadowy depths where magic flows like blood, spellcrafters forge their destiny
              </p>
            </div>
          </div>
        </HeroVideo>
      </div>
    </main>
  );
}
