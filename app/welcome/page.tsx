import Image from "next/image";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-void flex items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-8">
        {/* Logo */}
        <div className="relative w-32 h-32 mx-auto">
          <Image
            src="/design/logos/magicborn_logo.png"
            alt="Magicborn"
            fill
            className="object-contain"
          />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-glow">
            Welcome to the Magicborn
          </h1>
          <p className="text-lg text-text-secondary">
            Thank you for joining the waitlist. You&apos;ll be among the first to 
            experience the world where magic flows like blood and spellcrafters 
            forge their destiny.
          </p>
          <p className="text-text-muted">
            Check your email to confirm your subscription.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-medium hover:bg-ember/30 transition-colors"
          >
            Return Home
          </Link>
        </div>

        {/* Social hint */}
        <p className="text-sm text-text-muted">
          Follow our journey on{" "}
          <a
            href="https://discord.gg/JxXHZktcR7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ember-glow hover:underline"
          >
            Discord
          </a>
        </p>
      </div>
    </main>
  );
}




