// components/project/SettingsPage.tsx
// Settings page component

"use client";

import { useState } from "react";

export function SettingsPage() {
  const [magicbornMode, setMagicbornMode] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-glow">Project Settings</h1>

      {/* Project Information */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Project Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Project Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-deep border border-border rounded-lg text-text-primary focus:outline-none focus:border-ember-glow"
              placeholder="Enter project description"
              rows={4}
            />
          </div>
        </div>
      </section>

      {/* Magicborn Mode */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Game Systems</h2>
        <div className="p-4 bg-shadow border border-border rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={magicbornMode}
              onChange={(e) => setMagicbornMode(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-deep text-ember-glow focus:ring-ember-glow"
            />
            <div>
              <div className="font-semibold">Enable Magicborn Game Systems</div>
              <div className="text-sm text-text-muted mt-1">
                When enabled, Spells, Runes, Effects, and Combat Stats become available.
                All data is preserved when toggling this setting.
              </div>
            </div>
          </label>
        </div>
      </section>

      {/* Data Management */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Data Management</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow hover:bg-ember/30 transition-colors">
            Export Project
          </button>
          <button className="px-4 py-2 bg-deep border border-border rounded-lg hover:bg-deep/80 transition-colors">
            Import Project
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-ember/20 border border-ember/30 rounded-lg text-ember-glow font-semibold hover:bg-ember/30 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}

