"use client";

import { useState } from "react";
import DocumentationViewer, { ViewerMode } from "@components/DocumentationViewer";

export default function StyleGuidePage() {
  const [activeTab, setActiveTab] = useState<"design" | "system">("design");

  return (
    <main className="ml-64 mt-16 h-[calc(100vh-4rem)] bg-void text-text-primary overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header with Tabs */}
        <div className="border-b border-border bg-shadow px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-glow">Style Guide & Documentation</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("design")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "design"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              Design Documentation
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "system"
                  ? "bg-ember text-white border-2 border-ember-glow"
                  : "bg-deep text-text-secondary hover:text-ember-glow border-2 border-border"
              }`}
            >
              Design System
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {activeTab === "design" ? (
            <DocumentationViewer mode={ViewerMode.DESIGN} />
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-12 py-12 max-w-6xl">
                {/* Color Palette */}
                <section className="mb-16">
                  <h2 className="text-3xl font-bold mb-6 text-glow">Color Palette</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4">Base Colors</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-void border border-border"></div>
                          <div>
                            <div className="font-semibold">Void</div>
                            <div className="text-sm text-text-muted">#000000 - Primary background</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-shadow border border-border"></div>
                          <div>
                            <div className="font-semibold">Shadow</div>
                            <div className="text-sm text-text-muted">#0a0a0a - Card backgrounds</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-deep border border-border"></div>
                          <div>
                            <div className="font-semibold">Deep</div>
                            <div className="text-sm text-text-muted">#1a1a1a - Hover states</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-abyss border border-border"></div>
                          <div>
                            <div className="font-semibold">Abyss</div>
                            <div className="text-sm text-text-muted">#050505 - Deepest shadows</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4">Organic Accents</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-ember border border-ember-glow"></div>
                          <div>
                            <div className="font-semibold text-ember-glow">Ember</div>
                            <div className="text-sm text-text-muted">#8b4513 - Fire, action, primary CTA</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-ember-glow border border-ember"></div>
                          <div>
                            <div className="font-semibold text-ember-glow">Ember Glow</div>
                            <div className="text-sm text-text-muted">#cd853f - Highlights, glows</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-shadow-purple border border-shadow-purple-glow"></div>
                          <div>
                            <div className="font-semibold text-shadow-purple-glow">Shadow Purple</div>
                            <div className="text-sm text-text-muted">#2d1b2e - Mystical, magic</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Text Colors</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-text-primary text-2xl font-bold mb-2">Primary Text</div>
                        <div className="text-sm text-text-muted">#e8e6e3 - Main content</div>
                      </div>
                      <div>
                        <div className="text-text-secondary text-2xl font-bold mb-2">Secondary Text</div>
                        <div className="text-sm text-text-muted">#b8b5b0 - Supporting content</div>
                      </div>
                      <div>
                        <div className="text-text-glow text-2xl font-bold mb-2">Glow Text</div>
                        <div className="text-sm text-text-muted">#d4a574 - Headings, emphasis</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Typography */}
                <section className="mb-16">
                  <h2 className="text-3xl font-bold mb-6 text-glow">Typography</h2>
                  <div className="card space-y-6">
                    <div>
                      <h1 className="text-5xl font-bold mb-2">Heading 1</h1>
                      <p className="text-sm text-text-muted">Used for page titles and hero sections</p>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Heading 2</h2>
                      <p className="text-sm text-text-muted">Used for section titles</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Heading 3</h3>
                      <p className="text-sm text-text-muted">Used for subsection titles</p>
                    </div>
                    <div>
                      <p className="text-base mb-2">Body text - Regular paragraph text for main content. This is the default text size and weight used throughout the interface.</p>
                      <p className="text-sm text-text-muted">Small text - Used for captions, metadata, and secondary information</p>
                    </div>
                  </div>
                </section>

                {/* Components */}
                <section className="mb-16">
                  <h2 className="text-3xl font-bold mb-6 text-glow">Components</h2>
                  
                  <div className="card mb-6">
                    <h3 className="text-xl font-semibold mb-4">Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                      <button className="btn">Primary Button</button>
                      <button className="btn-secondary">Secondary Button</button>
                    </div>
                  </div>

                  <div className="card mb-6">
                    <h3 className="text-xl font-semibold mb-4">Badges</h3>
                    <div className="flex flex-wrap gap-4">
                      <span className="badge">Default Badge</span>
                      <span className="badge-glow">Glow Badge</span>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Cards</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="card">
                        <h4 className="font-semibold mb-2">Standard Card</h4>
                        <p className="text-sm text-text-secondary">Default card with subtle shadow and border</p>
                      </div>
                      <div className="card-glow">
                        <h4 className="font-semibold mb-2">Glow Card</h4>
                        <p className="text-sm text-text-secondary">Card with ember glow effect for emphasis</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Design Principles */}
                <section className="mb-16">
                  <h2 className="text-3xl font-bold mb-6 text-glow">Design Principles</h2>
                  <div className="card space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-ember-glow">Shadowy & Dark</h3>
                      <p className="text-text-secondary">Deep, rich blacks and dark grays create an immersive, mysterious atmosphere. Shadows are not just absence of light—they're a presence.</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-ember-glow">Organic & Natural</h3>
                      <p className="text-text-secondary">Colors and shapes feel natural, flowing, and alive. Nothing is perfectly geometric—there's always a hint of the organic world.</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-shadow-purple-glow">Mystical & Magical</h3>
                      <p className="text-text-secondary">Glows, shadows, and subtle effects create a sense of magic. The interface itself feels enchanted, not just functional.</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-ember-glow">Readable & Accessible</h3>
                      <p className="text-text-secondary">Despite the dark theme, text remains highly readable with proper contrast ratios. Functionality never sacrifices for aesthetics.</p>
                    </div>
                  </div>
                </section>

                {/* Usage Guidelines */}
                <section className="mb-16">
                  <h2 className="text-3xl font-bold mb-6 text-glow">Usage Guidelines</h2>
                  <div className="card space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">When to Use Ember (Red/Orange)</h3>
                      <ul className="list-disc list-inside text-text-secondary space-y-1 ml-4">
                        <li>Primary actions and CTAs</li>
                        <li>Fire-related spells and effects</li>
                        <li>Important warnings or alerts</li>
                        <li>Combat-related UI elements</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">When to Use Shadow Purple</h3>
                      <ul className="list-disc list-inside text-text-secondary space-y-1 ml-4">
                        <li>Mystical and magical elements</li>
                        <li>Void and shadow magic</li>
                        <li>Special or rare content</li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
