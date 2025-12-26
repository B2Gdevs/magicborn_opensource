// app/api/ai-stack/lmstudio/[...path]/route.ts
// Proxy API route for LM Studio to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

// LM Studio runs locally on the host machine
// When running in Docker, use host.docker.internal to reach the host
// Try multiple options: host.docker.internal (Mac/Windows), 172.17.0.1 (Linux), localhost (if not in Docker)
const getLMStudioUrls = () => {
  return [
    "http://host.docker.internal:1234", // Docker Desktop (Mac/Windows)
    "http://172.17.0.1:1234", // Docker default gateway (Linux)
    "http://127.0.0.1:1234", // Localhost (if not in Docker)
  ];
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join("/");
    
    // Get query parameters from the original request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // Get request body for POST/PUT requests
    let body: string | undefined;
    if (method === "POST" || method === "PUT") {
      try {
        body = await request.text();
      } catch {
        // No body provided
      }
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      // Forward any additional headers if needed
      ...(request.headers.get("authorization") && {
        authorization: request.headers.get("authorization")!,
      }),
    };

    // Try multiple URLs to reach LM Studio on the host machine
    // (needed because Docker containers can't use 127.0.0.1 to reach the host)
    const baseUrls = getLMStudioUrls();
    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const baseUrl of baseUrls) {
      const url = queryString ? `${baseUrl}/${path}?${queryString}` : `${baseUrl}/${path}`;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body || undefined,
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        break; // Success, exit loop
      } catch (error) {
        lastError = error as Error;
        continue; // Try next URL
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to connect to LM Studio. Make sure it's running on port 1234.");
    }

    // Get the response data
    const data = await response.json().catch(async () => {
      // If JSON parsing fails, return the text
      const text = await response.text();
      return { error: "Invalid JSON response", text };
    });

    // Return the response with CORS headers
    return NextResponse.json(
      {
        status: response.status,
        statusText: response.statusText,
        data,
      },
      {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to proxy request to LM Studio. Make sure LM Studio is running.",
        status: 500,
        statusText: "Internal Server Error",
        data: null,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
