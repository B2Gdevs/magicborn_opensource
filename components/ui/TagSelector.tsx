// components/ui/TagSelector.tsx
// Reusable tag selector component

"use client";

import { cn } from "@/lib/utils/cn";

export interface TagSelectorProps<T extends string> {
  options: T[];
  selected: T[];
  onChange: (tags: T[]) => void;
  label?: string;
  className?: string;
  required?: boolean;
  getLabel?: (tag: T) => string;
}

export function TagSelector<T extends string>({
  options,
  selected,
  onChange,
  label,
  className,
  required = false,
  getLabel = (tag) => tag,
}: TagSelectorProps<T>) {
  const toggleTag = (tag: T) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-semibold text-text-secondary mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1 rounded text-sm transition-all",
                isSelected
                  ? "bg-shadow-purple text-shadow-purple-glow border border-shadow-purple-glow"
                  : "bg-deep border border-border text-text-secondary hover:border-shadow-purple/50"
              )}
            >
              {getLabel(tag)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

