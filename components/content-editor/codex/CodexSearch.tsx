// CodexSearch.tsx
// Search input for codex sidebar

"use client";

interface CodexSearchProps {
  value: string;
  onChange: (value: string) => void;
  isCollapsed: boolean;
}

export function CodexSearch({ value, onChange, isCollapsed }: CodexSearchProps) {
  if (isCollapsed) return null;

  return (
    <div className="relative">
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 h-0.5 bg-ember-glow rounded-sm"
          />
        ))}
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-7 pr-2 py-1.5 text-sm bg-deep border border-border rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-ember-glow transition-colors"
      />
    </div>
  );
}

