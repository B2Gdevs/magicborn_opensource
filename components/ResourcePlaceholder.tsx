"use client";

interface ResourcePlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

export default function ResourcePlaceholder({ title, description, icon }: ResourcePlaceholderProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">{icon}</div>
        <h2 className="text-3xl font-bold text-glow mb-4">{title}</h2>
        <p className="text-text-secondary text-lg">{description}</p>
        <p className="text-text-muted mt-4 text-sm">
          Resource management UI coming soon
        </p>
      </div>
    </div>
  );
}

