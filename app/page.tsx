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
              <div className="relative w-64 h-64 mx-auto mb-8 animate-fade-in">
                <Image
                  src="/logos/magicborn_logo.png"
                  alt="Magicborn: Modred's Legacy"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              
              {/* Dramatic Subtext */}
              <p className="text-xl md:text-2xl text-white/90 mb-4 font-light max-w-3xl mx-auto drop-shadow-lg animate-fade-in-delay-2 leading-relaxed">
                You are <strong className="text-white font-bold">Magicborn</strong>—a military slave, your kind oppressed and used for war. 
                Treated as second-class citizens, silenced for your power. 
                <br /><br />
                <em className="text-white/80">Craft your spells to survive in this godforsaken land. 
                This is the story of the oppressed, and what they must do to survive... their way.</em>
              </p>
            </div>
          </div>
        </HeroVideo>
      </div>
    </main>
  );
}
