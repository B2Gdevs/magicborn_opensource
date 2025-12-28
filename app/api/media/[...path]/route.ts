// app/api/media/[...path]/route.ts
// Compatibility shim: redirects legacy Payload-like media URLs to /media/<filename>

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  // Examples we might receive:
  // /api/media/file/my.png
  // /api/media/my.png
  // /api/media/some/nested/path/my.png  (we will still use last segment)
  const filename = segments[segments.length - 1];

  if (!filename) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Redirect to the canonical public media URL
  return NextResponse.redirect(new URL(`/media/${filename}`, request.url), 302);
}
