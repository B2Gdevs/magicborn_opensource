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
  
  const response = NextResponse.json(swaggerSpec, { headers });
  return response;
}

