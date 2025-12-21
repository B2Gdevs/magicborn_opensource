// app/api/ai-stack/lmstudio/models/download/route.ts
// Download models by fetching from Hugging Face and placing in LM Studio's model directory

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// LM Studio models directory structure: ~/.lmstudio/models/publisher/model/model-file.gguf
// In Docker, this is mounted as a volume at /root/.lmstudio/models
// We need to access it from the Next.js container, so we'll use a shared volume
// For now, we'll try to write to a path that's accessible from both containers
const LM_STUDIO_MODELS_PATH = process.env.LM_STUDIO_MODELS_PATH || "/tmp/lmstudio-models";

async function downloadFromHuggingFace(modelIdentifier: string): Promise<{ url: string; filename: string } | null> {
  try {
    // Parse model identifier (e.g., "mistralai/Mistral-7B-Instruct-v0.3-GGUF")
    const [org, modelName] = modelIdentifier.split("/");
    if (!org || !modelName) {
      return null;
    }

    // Try to get model info from Hugging Face API
    const hfApiUrl = `https://huggingface.co/api/models/${org}/${modelName}`;
    const response = await fetch(hfApiUrl, {
      headers: {
        "User-Agent": "Magicborn/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const modelInfo = await response.json();
    
    // Look for GGUF files in the model's files
    // Try common GGUF file patterns
    const ggufFiles = modelInfo.siblings?.filter((file: any) => 
      file.rfilename?.endsWith(".gguf")
    ) || [];

    if (ggufFiles.length === 0) {
      return null;
    }

    // Prefer Q4_K_M quantization (good balance), fallback to first available
    const preferredFile = ggufFiles.find((f: any) => 
      f.rfilename.includes("Q4_K_M") || f.rfilename.includes("q4_k_m")
    ) || ggufFiles[0];

    const fileUrl = `https://huggingface.co/${org}/${modelName}/resolve/main/${preferredFile.rfilename}`;
    
    return {
      url: fileUrl,
      filename: preferredFile.rfilename,
    };
  } catch (error) {
    console.error("Error fetching model info from Hugging Face:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { modelIdentifier } = await request.json();

    if (!modelIdentifier) {
      return NextResponse.json(
        { error: "modelIdentifier is required" },
        { status: 400 }
      );
    }

    // Check if this is an Ollama model (simple identifier like "llama3.2")
    // Ollama models don't have the org/model format
    const isOllamaModel = !modelIdentifier.includes("/");
    
    if (isOllamaModel) {
      // For Ollama models, we need to use lms get command
      // Make HTTP request to lmstudio container to execute the command
      // Since we're on the same Docker network, we can make requests to http://lmstudio:1234
      
      const { dockerUrl, localhostUrl } = {
        dockerUrl: process.env.LM_STUDIO_URL || "http://lmstudio:1234",
        localhostUrl: "http://localhost:1234",
      };

      // Try to trigger download via HTTP request to lmstudio container
      // We'll try to make a request that executes lms get
      // Option 1: Try LM Studio API if it has a download endpoint
      // Option 2: Execute via container's shell if we can access it
      
      // For now, try making a request to see if LM Studio has a download API
      // If not, we'll need to set up a custom endpoint or use a different approach
      
      try {
        // Try common API endpoints for model downloads
        const possibleEndpoints = [
          "/api/v0/models/download",
          "/v1/models/download",
          "/api/download",
          "/download",
        ];

        let downloadSuccess = false;
        for (const baseUrl of [dockerUrl, localhostUrl]) {
          for (const endpoint of possibleEndpoints) {
            try {
              const url = `${baseUrl}${endpoint}`;
              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ model: modelIdentifier }),
                signal: AbortSignal.timeout(5000),
              });

              if (response.ok || response.status === 202) {
                const data = await response.json().catch(() => ({}));
                downloadSuccess = true;
                return NextResponse.json({
                  success: true,
                  message: "Model download initiated via LM Studio API",
                  data,
                  modelIdentifier,
                });
              }
            } catch {
              continue;
            }
          }
        }

        // Try our custom download API endpoint (port 8081)
        for (const baseUrl of [dockerUrl.replace(":1234", ":8081"), localhostUrl.replace(":1234", ":8081")]) {
          try {
            const url = `${baseUrl}/download`;
            const response = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model: modelIdentifier }),
              signal: AbortSignal.timeout(10000), // 10 second timeout for connection
            });

            const data = await response.json().catch(() => ({}));
            
            if (response.ok && data.success) {
              return NextResponse.json({
                success: true,
                message: "Model download initiated",
                data,
                modelIdentifier,
              });
            } else if (response.ok) {
              // API responded but download failed
              return NextResponse.json(
                {
                  success: false,
                  error: data.error || "Download failed",
                  message: data.message,
                  modelIdentifier,
                },
                { status: 500 }
              );
            }
          } catch (error) {
            // Continue to next URL or fallback
            continue;
          }
        }

        // If all API attempts fail, return instructions
        return NextResponse.json(
          {
            success: false,
            error: "Download API not available",
            message: "Unable to reach download API. Make sure the download server is running in the lmstudio container.",
            instructions: [
              `Run this command on your host machine:`,
              `docker exec lmstudio lms get "${modelIdentifier}"`,
            ],
            modelIdentifier,
            manualCommand: `docker exec lmstudio lms get "${modelIdentifier}"`,
          },
          { status: 501 }
        );
      } catch (error: any) {
        return NextResponse.json(
          {
            error: "Failed to trigger download",
            message: error.message,
            modelIdentifier,
          },
          { status: 500 }
        );
      }
    }

    // Parse Hugging Face model identifier (e.g., "mistralai/Mistral-7B-Instruct-v0.3-GGUF")
    const parts = modelIdentifier.split("/");
    if (parts.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid model identifier format",
          message: "Model identifier should be in format 'org/model-name' (e.g., 'mistralai/Mistral-7B-Instruct-v0.3-GGUF')",
          modelIdentifier,
        },
        { status: 400 }
      );
    }

    const org = parts[0];
    const modelName = parts.slice(1).join("/");
    const modelDir = join(LM_STUDIO_MODELS_PATH, org, modelName);

    // Check if model directory exists (model might already be downloaded)
    if (existsSync(modelDir)) {
      const files = await import("fs/promises").then(m => m.readdir(modelDir));
      if (files.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Model already exists",
          path: modelDir,
        });
      }
    }

    // Get download URL from Hugging Face
    const downloadInfo = await downloadFromHuggingFace(modelIdentifier);
    
    if (!downloadInfo) {
      // If we can't get from Hugging Face, try to use lms get via HTTP
      // Make request to lmstudio container to execute lms get
      try {
        const { dockerUrl, localhostUrl } = {
          dockerUrl: process.env.LM_STUDIO_URL || "http://lmstudio:1234",
          localhostUrl: "http://localhost:1234",
        };

        // Try to trigger download via LM Studio API if available
        // For now, return instructions since we can't execute docker exec
        return NextResponse.json(
          {
            success: false,
            error: "Could not find model on Hugging Face",
            message: `Unable to download "${modelIdentifier}" automatically.`,
            instructions: [
              `Run this command on your host machine:`,
              `docker exec lmstudio lms get "${modelIdentifier}"`,
            ],
            modelIdentifier,
            manualCommand: `docker exec lmstudio lms get "${modelIdentifier}"`,
          },
          { status: 404 }
        );
      } catch (error: any) {
        return NextResponse.json(
          {
            error: "Failed to download model",
            message: error.message,
            modelIdentifier,
          },
          { status: 500 }
        );
      }
    }

    // Create model directory
    await mkdir(modelDir, { recursive: true });

    // Download the model file
    const filePath = join(modelDir, downloadInfo.filename);
    
    try {
      const fileResponse = await fetch(downloadInfo.url, {
        headers: {
          "User-Agent": "Magicborn/1.0",
        },
      });

      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.statusText}`);
      }

      // Stream the file to disk
      const arrayBuffer = await fileResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        message: "Model downloaded successfully",
        path: filePath,
        filename: downloadInfo.filename,
        modelIdentifier,
      });
    } catch (downloadError: any) {
      // Clean up directory if download failed
      try {
        await import("fs/promises").then(m => m.rmdir(modelDir));
      } catch {
        // Ignore cleanup errors
      }

      return NextResponse.json(
        {
          error: "Failed to download model file",
          message: downloadError.message,
          modelIdentifier,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process download request" },
      { status: 500 }
    );
  }
}

