// lib/utils/cors.ts
// CORS helper for API routes

export function getCorsHeaders(origin: string | null): Headers {
  const allowedOrigins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4300",
    "http://127.0.0.1:4300",
  ];

  const headers = new Headers();
  
  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
}







