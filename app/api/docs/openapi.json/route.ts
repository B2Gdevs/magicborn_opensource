// app/api/docs/openapi.json/route.ts
// Serve OpenAPI specification as JSON

import { NextRequest, NextResponse } from "next/server";
import config from "@/payload.config";
import { getCorsHeaders } from "@lib/utils/cors";

export const dynamic = "force-dynamic";

async function getCollectionsAndGlobals() {
  // Dynamically get from payload config
  const resolvedConfig = await config;
  
  const collections = resolvedConfig.collections?.map(c => 
    typeof c === 'object' ? c.slug : c
  ) || [];
  
  const globals = resolvedConfig.globals?.map(g => 
    typeof g === 'object' ? g.slug : g
  ) || [];
  
  return { collections, globals };
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  
  const { collections, globals } = await getCollectionsAndGlobals();
  
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
  
  const paths: Record<string, any> = {};
  
  // Collection endpoints
  collections.forEach(collection => {
    const collectionPath = `/api/payload/${collection}`;
    
    paths[collectionPath] = {
      get: {
        summary: `List all ${collection}`,
        tags: [collection],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'where', in: 'query', schema: { type: 'object' }, description: 'Query filter' },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'depth', in: 'query', schema: { type: 'integer' }, description: 'Relationship depth' },
        ],
        responses: {
          '200': { description: 'List of documents' },
        },
      },
      post: {
        summary: `Create a ${collection}`,
        tags: [collection],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '201': { description: 'Created document' },
        },
      },
    };
    
    paths[`${collectionPath}/{id}`] = {
      get: {
        summary: `Get ${collection} by ID`,
        tags: [collection],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'depth', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'Document' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        summary: `Update ${collection}`,
        tags: [collection],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Updated document' },
        },
      },
      delete: {
        summary: `Delete ${collection}`,
        tags: [collection],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Deleted' },
        },
      },
    };
  });
  
  // Global endpoints
  globals.forEach(global => {
    paths[`/api/payload/globals/${global}`] = {
      get: {
        summary: `Get ${global} global`,
        tags: ['globals'],
        responses: {
          '200': { description: 'Global document' },
        },
      },
      post: {
        summary: `Update ${global} global`,
        tags: ['globals'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          '200': { description: 'Updated global' },
        },
      },
    };
  });
  
  // Auth endpoints
  paths['/api/payload/users/login'] = {
    post: {
      summary: 'Login',
      tags: ['auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        '200': { description: 'Login successful' },
        '401': { description: 'Invalid credentials' },
      },
    },
  };
  
  paths['/api/payload/users/logout'] = {
    post: {
      summary: 'Logout',
      tags: ['auth'],
      responses: { '200': { description: 'Logged out' } },
    },
  };
  
  paths['/api/payload/users/me'] = {
    get: {
      summary: 'Get current user',
      tags: ['auth'],
      responses: {
        '200': { description: 'Current user' },
        '401': { description: 'Not authenticated' },
      },
    },
  };

  // Create spec with dynamic servers
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Magicborn API',
      version: '1.0.0',
      description: `REST API powered by Payload CMS.\n\nCollections: ${collections.join(', ')}\n\nGlobals: ${globals.join(', ')}`,
    },
    servers,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'payload-token' },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  };
  
  const response = NextResponse.json(spec, { headers });
  return response;
}






