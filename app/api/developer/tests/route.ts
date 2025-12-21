// app/api/developer/tests/route.ts
// API route to run tests and stream output

import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const watch = searchParams.get("watch") === "true";
  const testFile = searchParams.get("file") || "";

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Build vitest command
      const args = [];
      if (watch) {
        args.push("--watch");
      } else {
        args.push("--run");
      }
      if (testFile) {
        args.push(testFile);
      }

      // Spawn vitest process using npx
      const testProcess = spawn("npx", ["vitest", ...args], {
        cwd: process.cwd(),
        shell: true,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          FORCE_COLOR: "1", // Enable colors for terminal output
          TERM: "xterm-256color", // Support 256 colors
        },
      });

      // Send initial message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "start", message: "Starting tests..." })}\n\n`)
      );

      // Handle stdout
      testProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "stdout", data: output })}\n\n`)
        );
      });

      // Handle stderr
      testProcess.stderr?.on("data", (data) => {
        const output = data.toString();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "stderr", data: output })}\n\n`)
        );
      });

      // Handle process exit
      testProcess.on("exit", (code) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "exit", code })}\n\n`)
        );
        if (!watch) {
          controller.close();
        }
      });

      // Handle errors
      testProcess.on("error", (error) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`)
        );
        controller.close();
      });

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        testProcess.kill();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

