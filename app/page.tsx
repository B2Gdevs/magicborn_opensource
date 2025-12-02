"use client";

import Image from "next/image";
import HeroVideo from "@components/HeroVideo";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section with Video Background - Full Screen Behind Nav */}
      <div className="fixed inset-0 z-0">
        <HeroVideo loopVideos={true}>
          <div className="container mx-auto px-12 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Logo */}
              <div className="relative w-64 h-64 mx-auto mb-12 animate-fade-in">
                <Image
                  src="/logos/magicborn_logo.png"
                  alt="Magicborn: Modred's Legacy"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              
              {/* Book-like Text */}
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-delay-2">
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed font-serif italic">
                  In the shadows where magic flows like blood, the <span className="text-ember-glow font-normal">Magicborn</span> serve. 
                  Oppressed. Silenced. Forced into war.
                </p>
                
                <p className="text-base md:text-lg text-text-secondary/90 leading-relaxed font-serif">
                  You are one of them. A military slave, your power both gift and curse. 
                  In this godforsaken land, survival comes not from strength, but from the spells you craft.
                </p>
                
                <p className="text-sm md:text-base text-text-muted leading-relaxed font-serif italic">
                  This is the story of the oppressed. Of what they must do to survive... <span className="text-ember-glow/80">their way.</span>
                </p>
              </div>
            </div>
          </div>
        </HeroVideo>
      </div>
    </main>
  );
}
