"use client";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabStripProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabStrip({ tabs, activeId, onChange }: TabStripProps) {
  return (
    <div className="inline-flex rounded-xl bg-slate-900/70 p-1 border border-slate-700">
      {tabs.map((t) => {
        const active = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              active
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {t.icon && <span className="text-sm">{t.icon}</span>}
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
