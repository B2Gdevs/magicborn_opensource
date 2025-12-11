// app/api/proxy/n8n/[...path]/route.ts
// Proxy route to allow n8n to be embedded in iframe by removing X-Frame-Options header
// This handles all paths dynamically

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "GET", params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "POST", params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "PUT", params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "DELETE", params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, "PATCH", params.path);
}

async function handleRequest(
  request: NextRequest,
  method: string,
  pathSegments: string[]
) {
  try {
    // Build the path from segments
    const path = "/" + pathSegments.join("/");
    
    // Build the n8n URL - try Docker service name first, then localhost
    const n8nBaseUrl = process.env.N8N_URL || "http://n8n:5678";
    const targetUrl = `${n8nBaseUrl}${path}${request.nextUrl.search}`;
    
    // Get request body if present
    let body: BodyInit | undefined;
    const contentType = request.headers.get("content-type");
    
    if (method !== "GET" && method !== "HEAD") {
      if (contentType?.includes("application/json")) {
        try {
          const json = await request.json();
          body = JSON.stringify(json);
        } catch {
          body = await request.text();
        }
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        body = await request.text();
      } else if (contentType?.includes("multipart/form-data")) {
        body = await request.formData();
      } else {
        try {
          body = await request.arrayBuffer();
        } catch {
          // No body
        }
      }
    }
    
    // Fetch from n8n
    const response = await fetch(targetUrl, {
      method,
      headers: {
        // Forward relevant headers
        "Accept": request.headers.get("Accept") || "*/*",
        "Accept-Language": request.headers.get("Accept-Language") || "en-US,en;q=0.9",
        "Content-Type": contentType || "",
        "Referer": request.headers.get("Referer") || "",
        "User-Agent": request.headers.get("User-Agent") || "Next.js Proxy",
      },
      body,
    });

    // Get the response body
    const responseContentType = response.headers.get("content-type") || "";
    let responseBody: any;
    
    if (responseContentType.includes("application/json")) {
      responseBody = await response.json();
    } else if (responseContentType.includes("text") || responseContentType.includes("javascript")) {
      responseBody = await response.text();
    } else {
      responseBody = await response.arrayBuffer();
    }

    // Create headers, removing X-Frame-Options and modifying CSP
    const headers = new Headers();
    
    // Copy all headers except security headers that block iframe embedding
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase();
      if (
        !lowerKey.includes("x-frame-options") &&
        !lowerKey.includes("frame-ancestors") &&
        !lowerKey.includes("content-length") // Let Next.js set this
      ) {
        // Modify CSP to allow frame-ancestors
        if (lowerKey === "content-security-policy") {
          const modifiedCSP = value
            .replace(/frame-ancestors[^;]*;?/gi, "")
            .trim();
          if (modifiedCSP) {
            headers.set(key, modifiedCSP);
          }
        } else {
          headers.set(key, value);
        }
      }
    }
    
    // Allow embedding
    headers.set("X-Frame-Options", "ALLOWALL");
    
    // Create response
    const proxyResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

    return proxyResponse;
  } catch (error) {
    console.error(`Error proxying n8n ${method} request:`, error);
    return NextResponse.json(
      { error: `Failed to proxy n8n ${method} request: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}


