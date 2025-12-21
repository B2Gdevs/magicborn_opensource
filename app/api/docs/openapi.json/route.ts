// app/api/docs/openapi.json/route.ts
// Serve OpenAPI specification as JSON

import { NextRequest, NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";
import { getCorsHeaders } from "@/lib/utils/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  
  // Determine the base URL dynamically based on the request
  const host = request.headers.get("host") ?? "localhost:4300";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;
  
  // Check if request is from Docker network (hostname will be "web" or contain service name)
  const isDockerNetwork = host.includes("web") || host.includes(":3000");
  
  // Build servers array with Docker network URL first (for Open WebUI)
  // and the request's base URL as fallback (for browser access)
  const servers = [
    {
      url: "http://web:3000",
      description: "Docker network (for Open WebUI)",
    },
    {
      url: baseUrl,
      description: isDockerNetwork ? "Auto-detected base URL" : "Host mapped (browser access)",
    },
    {
      url: "http://localhost:4300",
      description: "Host mapped (fallback)",
    },
  ];
  
  // Create spec with dynamic servers
  const spec = {
    ...swaggerSpec,
    servers,
  };
  
  const response = NextResponse.json(spec, { headers });
  return response;
}




