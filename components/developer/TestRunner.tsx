// components/developer/TestRunner.tsx
// Component to run and display test output in real-time

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Play, Square, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Convert from "ansi-to-html";
import { TestOutputViewer } from "./TestOutputViewer";

interface TestOutput {
  type: "start" | "stdout" | "stderr" | "exit" | "error";
  data?: string;
  message?: string;
  code?: number;
  error?: string;
}

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "passed" | "failed">("idle");
  const outputEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ANSI to HTML converter with terminal-like colors
  const converter = useMemo(() => new Convert({
    fg: '#FFFFFF',
    bg: '#000000',
    newline: true,
    escapeXML: true,
    stream: true,
    colors: {
      0: '#000000',   // black
      1: '#cd3131',   // red
      2: '#0dbc79',   // green
      3: '#e5e510',   // yellow
      4: '#2472c8',   // blue
      5: '#bc3fbc',   // magenta
      6: '#11a8cd',   // cyan
      7: '#e5e5e5',   // white
      8: '#666666',   // bright black
      9: '#f14c4c',   // bright red
      10: '#23d18b',  // bright green
      11: '#f5f543',  // bright yellow
      12: '#3b8eea',  // bright blue
      13: '#d670d6',  // bright magenta
      14: '#29b8db',  // bright cyan
      15: '#e5e5e5',  // bright white
    }
  }), []);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const startTests = async (watch: boolean = false, testPattern?: string) => {
    // Clean up existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsRunning(true);
    setIsWatching(watch);
    setOutput([]);
    setTestStatus("running");

    // Create abort controller for stopping
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("watch", watch.toString());
      if (testPattern) {
        params.set("file", testPattern);
      }
      
      // Use fetch with streaming
      const response = await fetch(`/api/developer/tests?${params.toString()}`, {
        signal: abortController.signal,
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to get response stream");
      }

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (!watch) {
                setIsRunning(false);
              }
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data: TestOutput = JSON.parse(line.slice(6));

                  switch (data.type) {
                    case "start":
                      setOutput((prev) => [...prev, `🚀 ${data.message || "Starting tests..."}\n`]);
                      break;
                    case "stdout":
                    case "stderr":
                      if (data.data) {
                        setOutput((prev) => [...prev, data.data || ""]);
                        // Check for test results in output
                        if (data.data.includes("✓") || data.data.includes("PASS")) {
                          setTestStatus("passed");
                        } else if (data.data.includes("✗") || data.data.includes("FAIL")) {
                          setTestStatus("failed");
                        }
                      }
                      break;
                    case "exit":
                      setIsRunning(false);
                      if (!watch) {
                        if (data.code === 0) {
                          setTestStatus("passed");
                        } else {
                          setTestStatus("failed");
                        }
                      }
                      break;
                    case "error":
                      setOutput((prev) => [...prev, `❌ Error: ${data.error}\n`]);
                      setIsRunning(false);
                      setTestStatus("failed");
                      break;
                  }
                } catch (parseError) {
                  // If it's not JSON, treat as raw output
                  const rawData = line.slice(6);
                  if (rawData.trim()) {
                    setOutput((prev) => [...prev, rawData + "\n"]);
                  }
                }
              }
            }
          }
        } catch (error) {
          setOutput((prev) => [...prev, `❌ Error reading stream: ${error}\n`]);
          setIsRunning(false);
          setTestStatus("failed");
        }
      };

      readStream();
    } catch (error) {
      setOutput((prev) => [...prev, `❌ Failed to start tests: ${error}\n`]);
      setIsRunning(false);
      setTestStatus("failed");
    }
  };

  const stopTests = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setIsWatching(false);
    setOutput((prev) => [...prev, "\n⏹️  Tests stopped\n"]);
    setTestStatus("idle");
  };

  const clearOutput = () => {
    setOutput([]);
    setTestStatus("idle");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getStatusIcon = () => {
    if (isRunning) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    }
    switch (testStatus) {
      case "passed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-text-muted" />;
    }
  };

  const getStatusText = () => {
    if (isRunning) {
      return isWatching ? "Watching..." : "Running...";
    }
    switch (testStatus) {
      case "passed":
        return "Passed";
      case "failed":
        return "Failed";
      default:
        return "Idle";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-text-primary">Test Runner</h3>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-text-secondary">{getStatusText()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <>
              <button
                onClick={() => startTests(false)}
                className="px-4 py-2 bg-ember hover:bg-ember-glow text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run Tests
              </button>
              <button
                onClick={() => startTests(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Watch Tests
              </button>
            </>
          ) : (
            <button
              onClick={stopTests}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}
          <button
            onClick={clearOutput}
            className="px-4 py-2 bg-deep hover:bg-deep/80 text-text-secondary rounded-lg font-medium transition-colors"
            disabled={isRunning}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-black border border-border rounded-lg overflow-hidden">
        <div className="bg-deep px-4 py-2 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span>Test Output</span>
            {isWatching && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                Watch Mode
              </span>
            )}
          </div>
        </div>
        <div className="h-[600px] overflow-y-auto p-4 bg-black">
          {output.length === 0 ? (
            <div className="text-text-muted text-center py-8">
              Click "Run Tests" or "Watch Tests" to start
            </div>
          ) : (
            <TestOutputViewer 
              output={output} 
              converter={converter}
              onRunCategory={(pattern) => startTests(false, pattern)}
            />
          )}
          <div ref={outputEndRef} />
        </div>
      </div>

      <div className="text-xs text-text-muted space-y-1">
        <p>• <strong>Run Tests:</strong> Execute tests once and show results</p>
        <p>• <strong>Watch Tests:</strong> Run tests in watch mode - automatically re-runs on file changes</p>
        <p>• Tests are run using Vitest with the same configuration as your CLI</p>
      </div>
    </div>
  );
}

