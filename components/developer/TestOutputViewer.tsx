// components/developer/TestOutputViewer.tsx
// Organized test output viewer with folder grouping

"use client";

import { useMemo, useState } from "react";
import Convert from "ansi-to-html";
import { Play } from "lucide-react";

interface TestOutputViewerProps {
  output: string[];
  converter: Convert;
  onRunCategory?: (pattern: string) => void;
}

interface TestFileGroup {
  category: string;
  files: Array<{
    path: string;
    name: string;
    output: string;
    stats?: {
      total: number;
      passed: number;
      failed: number;
    };
  }>;
  stats: {
    total: number;
    passed: number;
    failed: number;
  };
}

export function TestOutputViewer({ output, converter, onRunCategory }: TestOutputViewerProps) {
  // Categories based on folder structure
  const categoryMap: Record<string, string> = {
    "components/character": "Character Forms",
    "components/spell": "Spell Forms",
    "components/region": "Region Forms",
    "components/object": "Object Forms",
    "components/lore": "Lore Forms",
    "lib/__tests__/combat": "Combat Tests",
    "lib/__tests__/player": "Player Tests",
    "lib/__tests__/data": "Data Tests",
    "lib/__tests__/evolution": "Evolution Tests",
    "lib/__tests__/ai": "AI Tests",
    "lib/utils/__tests__": "Utils Tests",
  };

  // Reverse mapping: category name -> folder pattern
  const categoryToPattern: Record<string, string> = {};
  for (const [pattern, category] of Object.entries(categoryMap)) {
    categoryToPattern[category] = pattern;
  }

  // Parse output and group by folder/category
  const groupedOutput = useMemo(() => {
    const fullOutput = output.join("");
    const groups: Record<string, TestFileGroup> = {};

    // Remove ANSI codes for parsing (but keep original for display)
    const cleanOutput = fullOutput.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Split output by test file markers
    const lines = cleanOutput.split("\n");
    let currentFile: string | null = null;
    let currentCategory = "Other";
    let currentFileOutput: string[] = [];
    let currentFileStats: { total: number; passed: number; failed: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect test file start - Vitest outputs like:
      // " ✓ lib/__tests__/data/effects.test.ts (3 tests) 4ms"
      // " ❯ components/spell/__tests__/SpellForm.test.tsx (12 tests | 12 failed) 162ms"
      // " × components/character/__tests__/CharacterForm.test.tsx (8 tests | 2 failed) 45ms"
      // Pattern: [✓❯×] path/to/file.test.ts (info)
      // Also handle cases where symbols might be encoded differently
      const fileMatch = line.match(/(?:[❯✓×]|>|\+|-)\s+([^\s]+\.test\.(ts|tsx|js|jsx))(?:\s+\(([^)]+)\))?/);
      if (fileMatch) {
        // Save previous file if exists
        if (currentFile && currentFileOutput.length > 0) {
          const filePath = currentFile;
          // Determine category
          currentCategory = "Other";
          for (const [pattern, category] of Object.entries(categoryMap)) {
            if (filePath.includes(pattern)) {
              currentCategory = category;
              break;
            }
          }
          
          if (!groups[currentCategory]) {
            groups[currentCategory] = {
              category: currentCategory,
              files: [],
              stats: { total: 0, passed: 0, failed: 0 },
            };
          }
          
          const fileStats = currentFileStats || { total: 0, passed: 0, failed: 0 };
          
          groups[currentCategory].files.push({
            path: currentFile,
            name: currentFile.split("/").pop() || currentFile,
            output: currentFileOutput.join("\n"),
            stats: fileStats,
          });
          
          // Aggregate stats for category
          groups[currentCategory].stats.total += fileStats.total;
          groups[currentCategory].stats.passed += fileStats.passed;
          groups[currentCategory].stats.failed += fileStats.failed;
        }
        
        // Parse test statistics from the line
        // Examples: "(3 tests)", "(12 tests | 12 failed)", "(8 tests | 2 failed)"
        let stats = { total: 0, passed: 0, failed: 0 };
        const statsMatch = fileMatch[3];
        if (statsMatch) {
          // Extract total tests
          const totalMatch = statsMatch.match(/(\d+)\s+tests?/);
          if (totalMatch) {
            stats.total = parseInt(totalMatch[1], 10);
          }
          
          // Extract failed tests
          const failedMatch = statsMatch.match(/(\d+)\s+failed/);
          if (failedMatch) {
            stats.failed = parseInt(failedMatch[1], 10);
          }
          
          // Calculate passed
          stats.passed = stats.total - stats.failed;
        }
        
        // Check symbol to determine status if stats not found
        const symbol = line.trim()[0];
        if (stats.total === 0) {
          // If we can't parse stats but see ×, assume failures
          if (symbol === '×' || symbol === 'x' || symbol === 'X') {
            stats.failed = 1;
            stats.total = 1;
          } else if (symbol === '✓' || symbol === 'v' || symbol === 'V') {
            stats.passed = 1;
            stats.total = 1;
          }
        }
        
        // Start new file - use original line with ANSI codes for display
        currentFile = fileMatch[1];
        currentFileStats = stats;
        // Get the original line from fullOutput to preserve ANSI codes
        const originalLines = fullOutput.split("\n");
        currentFileOutput = [originalLines[i] || line];
      } else if (currentFile) {
        // Continue collecting output for current file - use original with ANSI codes
        const originalLines = fullOutput.split("\n");
        currentFileOutput.push(originalLines[i] || line);
      } else {
        // Output before any test file detected - add to "General" category
        if (!groups["General"]) {
          groups["General"] = {
            category: "General",
            files: [],
            stats: { total: 0, passed: 0, failed: 0 },
          };
        }
        if (groups["General"].files.length === 0) {
          groups["General"].files.push({
            path: "startup",
            name: "Startup Output",
            output: "",
          });
        }
        if (groups["General"].files[0]) {
          groups["General"].files[0].output += line + "\n";
        }
      }
    }

    // Save last file
    if (currentFile && currentFileOutput.length > 0) {
      currentCategory = "Other";
      for (const [pattern, category] of Object.entries(categoryMap)) {
        if (currentFile.includes(pattern)) {
          currentCategory = category;
          break;
        }
      }
      
      if (!groups[currentCategory]) {
        groups[currentCategory] = {
          category: currentCategory,
          files: [],
          stats: { total: 0, passed: 0, failed: 0 },
        };
      }
      
      const fileStats = currentFileStats || { total: 0, passed: 0, failed: 0 };
      
      groups[currentCategory].files.push({
        path: currentFile,
        name: currentFile.split("/").pop() || currentFile,
        output: currentFileOutput.join("\n"),
        stats: fileStats,
      });
      
      // Aggregate stats for category
      groups[currentCategory].stats.total += fileStats.total;
      groups[currentCategory].stats.passed += fileStats.passed;
      groups[currentCategory].stats.failed += fileStats.failed;
    }

    // Clean up empty general output
    if (groups["General"] && groups["General"].files[0] && !groups["General"].files[0].output.trim()) {
      delete groups["General"];
    }

    // If no grouping found, return all output as "All Tests"
    if (Object.keys(groups).length === 0) {
      return {
        "All Tests": {
          category: "All Tests",
          files: [{
            path: "output",
            name: "Test Output",
            output: fullOutput,
          }],
          stats: { total: 0, passed: 0, failed: 0 },
        },
      };
    }

    return groups;
  }, [output]);

  const categories = Object.values(groupedOutput);
  const hasGroupedFiles = categories.some(cat => cat.files.length > 0 && cat.files[0].path !== "output" && cat.files[0].path !== "startup");
  
  // Filter categories to only those with actual test files
  const testCategories = categories.filter(cat => {
    const testFiles = cat.files.filter(f => f.path !== "startup" && f.path !== "output");
    return testFiles.length > 0;
  });

  const [activeTab, setActiveTab] = useState<string | null>(
    testCategories.length > 0 ? testCategories[0].category : null
  );

  // If we have grouped test files, show tabbed organized view
  if (hasGroupedFiles && testCategories.length > 0) {
    return (
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {testCategories.map((group) => {
            const testFiles = group.files.filter(f => f.path !== "startup" && f.path !== "output");
            const isActive = activeTab === group.category;
            const stats = group.stats || { total: 0, passed: 0, failed: 0 };
            const pattern = categoryToPattern[group.category];
            
            const handleRunCategory = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (onRunCategory) {
                // If we have a pattern for this category, use it
                if (pattern) {
                  // Build pattern for all test files in this category
                  const testPattern = `${pattern}/**/*.test.{ts,tsx,js,jsx}`;
                  onRunCategory(testPattern);
                } else if (testFiles.length > 0) {
                  // Fallback: use the first test file's directory
                  const firstFile = testFiles[0];
                  const dirPath = firstFile.path.substring(0, firstFile.path.lastIndexOf('/'));
                  const testPattern = `${dirPath}/**/*.test.{ts,tsx,js,jsx}`;
                  onRunCategory(testPattern);
                }
              }
            };
            
            return (
              <div key={group.category} className="flex items-center gap-1 group">
                <button
                  onClick={() => setActiveTab(group.category)}
                  className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${
                    isActive
                      ? "border-ember-glow text-ember-glow"
                      : "border-transparent text-text-muted hover:text-text-primary"
                  }`}
                >
                  <span>{group.category}</span>
                  <div className="flex items-center gap-1.5 text-xs">
                    {stats.total > 0 && (
                      <>
                        {stats.passed > 0 && (
                          <span className="flex items-center gap-1 text-green-400" title={`${stats.passed} passed`}>
                            <span className="text-green-400">✓</span>
                            <span>{stats.passed}</span>
                          </span>
                        )}
                        {stats.failed > 0 && (
                          <span className="flex items-center gap-1 text-red-400" title={`${stats.failed} failed`}>
                            <span className="text-red-400">×</span>
                            <span>{stats.failed}</span>
                          </span>
                        )}
                        <span className="text-text-muted opacity-70" title={`${stats.total} total`}>
                          / {stats.total}
                        </span>
                      </>
                    )}
                    <span className="text-text-muted opacity-70 ml-1">({testFiles.length} file{testFiles.length !== 1 ? 's' : ''})</span>
                  </div>
                </button>
                {onRunCategory && (pattern || testFiles.length > 0) && (
                  <button
                    onClick={handleRunCategory}
                    className="px-2 py-1 text-xs text-text-muted hover:text-ember-glow hover:bg-deep/50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title={`Run ${group.category} tests`}
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Tab Content */}
        {testCategories.map((group) => {
          const testFiles = group.files.filter(f => f.path !== "startup" && f.path !== "output");
          if (activeTab !== group.category) return null;

          return (
            <div key={group.category} className="space-y-2">
              {testFiles.map((file, idx) => {
                const fileStats = file.stats || { total: 0, passed: 0, failed: 0 };
                return (
                  <details key={idx} className="border border-border/50 rounded overflow-hidden">
                    <summary className="px-3 py-2 bg-deep/30 hover:bg-deep/50 cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{file.name}</span>
                        {fileStats.total > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            {fileStats.passed > 0 && (
                              <span className="flex items-center gap-1 text-green-400">
                                <span>✓</span>
                                <span>{fileStats.passed}</span>
                              </span>
                            )}
                            {fileStats.failed > 0 && (
                              <span className="flex items-center gap-1 text-red-400">
                                <span>×</span>
                                <span>{fileStats.failed}</span>
                              </span>
                            )}
                            <span className="text-text-muted">/ {fileStats.total}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-text-muted ml-2">{file.path}</span>
                    </summary>
                  <div
                    className="p-4 font-mono text-xs bg-black whitespace-pre-wrap [&_span]:leading-relaxed max-h-[500px] overflow-y-auto"
                    style={{
                      lineHeight: '1.5',
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: converter.toHtml(file.output)
                    }}
                  />
                  </details>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: show all output in simple view
  const allOutput = output.join("");
  return (
    <div
      className="font-mono text-sm bg-black whitespace-pre-wrap [&_span]:leading-relaxed"
      style={{
        lineHeight: '1.5',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      }}
      dangerouslySetInnerHTML={{
        __html: converter.toHtml(allOutput)
      }}
    />
  );
}

