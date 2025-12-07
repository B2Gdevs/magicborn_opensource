// app/api/ai-stack/n8n/workflows/route.ts
// Export and save n8n workflows to the project

import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const WORKFLOWS_DIR = join(process.cwd(), "infra", "ai-stack", "n8n", "magicborn", "workflows");
const API_KEY_FILE = join(process.cwd(), "infra", "ai-stack", "n8n", ".api-key");

// Get API key from file or environment
async function getApiKey(): Promise<string | null> {
  // First check environment variable
  if (process.env.N8N_API_KEY) {
    return process.env.N8N_API_KEY;
  }
  
  // Then check file
  if (existsSync(API_KEY_FILE)) {
    try {
      const key = await readFile(API_KEY_FILE, "utf-8");
      return key.trim() || null;
    } catch {
      return null;
    }
  }
  
  return null;
}

// Ensure workflows directory exists
async function ensureWorkflowsDir() {
  if (!existsSync(WORKFLOWS_DIR)) {
    await mkdir(WORKFLOWS_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    // Fetch workflows from n8n
    const headers: HeadersInit = {};
    const apiKey = await getApiKey();
    if (apiKey) {
      headers["X-N8N-API-KEY"] = apiKey;
    }

    // Try Docker service name first, then localhost
    const n8nBaseUrl = process.env.N8N_URL || "http://n8n:5678";
    const url = `${n8nBaseUrl}/api/v1/workflows`;
    
    let response: Response;
    let errorText = "";
    
    try {
      response = await fetch(url, {
        headers,
      });
    } catch (fetchError) {
      // Try localhost as fallback
      const localhostUrl = "http://localhost:5678/api/v1/workflows";
      try {
        response = await fetch(localhostUrl, {
          headers,
        });
      } catch (localhostError) {
        console.error("Error fetching workflows from both n8n service and localhost:", fetchError, localhostError);
        return NextResponse.json(
          { 
            error: "Failed to connect to n8n",
            details: fetchError instanceof Error ? fetchError.message : "Connection error",
            suggestion: "Make sure n8n is running and accessible"
          },
          { status: 500 }
        );
      }
    }

    if (!response.ok) {
      // Try to get error message from response
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorText = await response.text().catch(() => `HTTP ${response.status}`);
      }

      console.error(`n8n API error (${response.status}):`, errorText);

      // Provide helpful error messages based on status code
      let userMessage = "Failed to fetch workflows from n8n";
      let suggestion = "";

      if (response.status === 401) {
        userMessage = "n8n requires authentication";
        suggestion = "n8n may require user login or an API key. Try opening n8n in a browser first to log in, or set N8N_API_KEY environment variable.";
      } else if (response.status === 403) {
        userMessage = "Access forbidden";
        suggestion = "You don't have permission to access workflows. Make sure you're logged into n8n.";
      } else if (response.status === 404) {
        userMessage = "n8n API endpoint not found";
        suggestion = "The n8n API endpoint may have changed. Check n8n version compatibility.";
      }

      return NextResponse.json(
        { 
          error: userMessage,
          details: errorText,
          suggestion,
          status: response.status,
          url: url.includes("n8n:5678") ? "http://n8n:5678/api/v1/workflows" : "http://localhost:5678/api/v1/workflows"
        },
        { status: response.status }
      );
    }

    const workflows = await response.json();
    return NextResponse.json({ workflows });
  } catch (error) {
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch workflows",
        details: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Is n8n running? Check the service status tab."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { workflowId, workflowName } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId is required" },
        { status: 400 }
      );
    }

    // Fetch workflow from n8n
    const headers: HeadersInit = {};
    const apiKey = await getApiKey();
    if (apiKey) {
      headers["X-N8N-API-KEY"] = apiKey;
    }

    // Try Docker service name first, then localhost
    const n8nBaseUrl = process.env.N8N_URL || "http://n8n:5678";
    const url = `${n8nBaseUrl}/api/v1/workflows/${workflowId}`;
    
    let response: Response;
    let errorText = "";
    
    try {
      response = await fetch(url, {
        headers,
      });
    } catch (fetchError) {
      // Try localhost as fallback
      const localhostUrl = `http://localhost:5678/api/v1/workflows/${workflowId}`;
      try {
        response = await fetch(localhostUrl, {
          headers,
        });
      } catch (localhostError) {
        console.error("Error fetching workflow from both n8n service and localhost:", fetchError, localhostError);
        return NextResponse.json(
          { 
            error: "Failed to connect to n8n",
            details: fetchError instanceof Error ? fetchError.message : "Connection error"
          },
          { status: 500 }
        );
      }
    }

    if (!response.ok) {
      // Try to get error message from response
      try {
        const errorData = await response.json();
        errorText = errorData.message || errorData.error || `HTTP ${response.status}`;
      } catch {
        errorText = await response.text().catch(() => `HTTP ${response.status}`);
      }

      console.error(`n8n API error (${response.status}):`, errorText);

      let userMessage = "Failed to fetch workflow from n8n";
      let suggestion = "";

      if (response.status === 401) {
        userMessage = "n8n requires authentication";
        suggestion = "n8n may require user login or an API key. Try opening n8n in a browser first to log in.";
      } else if (response.status === 403) {
        userMessage = "Access forbidden";
        suggestion = "You don't have permission to access this workflow.";
      } else if (response.status === 404) {
        userMessage = "Workflow not found";
        suggestion = "The workflow may have been deleted or the ID is incorrect.";
      }

      return NextResponse.json(
        { 
          error: userMessage,
          details: errorText,
          suggestion,
          status: response.status
        },
        { status: response.status }
      );
    }

    const workflow = await response.json();

    // Ensure directory exists
    await ensureWorkflowsDir();

    // Ensure workflow has required fields for import
    const workflowToSave = {
      ...workflow,
      // Ensure active field exists (default to false for imported workflows)
      active: workflow.active ?? false,
      // Ensure id exists
      id: workflow.id || workflowId,
    };

    // Save workflow to file
    const fileName = workflowName 
      ? `${workflowName.replace(/[^a-z0-9]/gi, "_")}.json`
      : `workflow_${workflowId}.json`;
    const filePath = join(WORKFLOWS_DIR, fileName);

    await writeFile(filePath, JSON.stringify(workflowToSave, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: `Workflow saved to ${filePath}`,
      filePath,
    });
  } catch (error) {
    console.error("Error saving workflow:", error);
    return NextResponse.json(
      { 
        error: "Failed to save workflow",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

