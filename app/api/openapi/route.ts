import { NextResponse } from 'next/server';
import config from '@/payload.config';

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

export async function GET() {
  const { collections, globals } = await getCollectionsAndGlobals();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4300';
  
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

  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Magicborn API',
      version: '1.0.0',
      description: `REST API powered by Payload CMS.\n\nCollections: ${collections.join(', ')}\n\nGlobals: ${globals.join(', ')}`,
    },
    servers: [{ url: baseUrl, description: 'Current server' }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'payload-token' },
      },
    },
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
  };
  
  return NextResponse.json(spec);
}
