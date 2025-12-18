'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface DevDocsTocProps {
  headings: Heading[];
}

export default function DevDocsToc({ headings }: DevDocsTocProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -60% 0%' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0">
      <div className="sticky top-24 pt-8">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
          On This Page
        </h3>
        <nav className="space-y-1">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const indent = heading.level === 3 ? 'pl-4' : heading.level === 4 ? 'pl-8' : '';
            
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={`
                  block py-1.5 text-sm transition-colors border-l-2
                  ${indent}
                  ${isActive 
                    ? 'border-ember-glow text-ember-glow pl-3' 
                    : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border pl-3'
                  }
                `}
              >
                {heading.text}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

