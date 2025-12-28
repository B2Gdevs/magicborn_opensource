// app/api/payload/[...slug]/route.ts
// Payload CMS API route handler using Local API

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Collections } from '@/lib/payload/constants'

async function getPayloadClient() {
  return await getPayload({ config })
}

// Helper function to construct media URL from filename
// Payload stores just the filename, we construct the URL from staticURL + filename
function getMediaUrl(filename: string | null | undefined): string | undefined {
  if (!filename) return undefined
  return `/media/${filename}`
}

// Helper function to normalize media URLs in documents and relationships
function normalizeMediaUrlsInDoc(doc: any): any {
  if (!doc || typeof doc !== "object") return doc;

  const normalized = Array.isArray(doc) ? [...doc] : { ...doc };

  // If this is a direct media doc:
  if ((normalized as any).filename) {
    (normalized as any).url = getMediaUrl((normalized as any).filename);
  }

  // Helper to normalize a relationship media object
  const normalizeMediaRel = (rel: any) => {
    if (rel && typeof rel === "object" && rel.filename) {
      return { ...rel, url: getMediaUrl(rel.filename) };
    }
    return rel;
  };

  // Common relationship fields you already handle
  if ((normalized as any).image) (normalized as any).image = normalizeMediaRel((normalized as any).image);
  if ((normalized as any).featuredImage) (normalized as any).featuredImage = normalizeMediaRel((normalized as any).featuredImage);
  if ((normalized as any).landmarkIcon) (normalized as any).landmarkIcon = normalizeMediaRel((normalized as any).landmarkIcon);
  if ((normalized as any).logo) (normalized as any).logo = normalizeMediaRel((normalized as any).logo);

  return normalized;
}


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const searchParams = request.nextUrl.searchParams
  const draft = searchParams.get('draft') === 'true'

  // Parse slug: e.g., ['projects'] or ['projects', '123'] or ['globals', 'site-config']
  const [first, second, third] = slug

  try {
    // Handle auth: /api/payload/users/me
    if (first === 'users' && second === 'me') {
      // Get user from cookie/token - Payload handles this
      const { user } = await payload.auth({ headers: request.headers })
      return NextResponse.json({ user })
    }

    // Handle globals: /api/payload/globals/{slug}
    if (first === 'globals' && second) {
      const global = await payload.findGlobal({
        slug: second as 'site-config' | 'sidebar-config',
      })
      return NextResponse.json(global)
    }

    // Handle versions endpoint: /api/payload/{collection}/{id}/versions
    if (slug.length === 3 && third === 'versions') {
      const [collection, id] = slug
      const result = await payload.findVersions({
        collection: collection as any,
        where: { parent: { equals: id } },
        limit: 20,
        sort: '-updatedAt',
      })
      return NextResponse.json(result)
    }

    const [collection, id] = slug

    if (id) {
      // Get single document
      const doc = await payload.findByID({
        collection: collection as any,
        id,
        ...(draft ? { draft: true } : {}),
      })

      // Normalize media URLs if this is a media document - just use filename
      if (collection === 'media') {
        const mediaDoc = doc as any
        return NextResponse.json({
          ...mediaDoc,
          url: getMediaUrl(mediaDoc.filename)
        })
      }

      // Normalize media URLs in relationships (e.g., image fields)
      const normalizedDoc = normalizeMediaUrlsInDoc(doc as any)
      return NextResponse.json(normalizedDoc)
    } else if (collection) {
      // Get collection
      const limit = parseInt(searchParams.get('limit') || '10')
      const page = parseInt(searchParams.get('page') || '1')

      // Parse where clauses from query params (e.g., where[project][equals]=1)
      const where: Record<string, any> = {}
      searchParams.forEach((value, key) => {
        if (key.startsWith('where[')) {
          // Parse where[field][operator]=value
          const match = key.match(/where\[([^\]]+)\]\[([^\]]+)\]/)
          if (match) {
            const [, field, operator] = match
            if (!where[field]) {
              where[field] = {}
            }
            // Try to parse as number if it looks like one
            const numValue = /^\d+$/.test(value) ? parseInt(value, 10) : value
            where[field][operator] = numValue
          }
        }
      })

      // Parse sort
      const sort = searchParams.get('sort') || undefined

      const result = await payload.find({
        collection: collection as any,
        ...(Object.keys(where).length > 0 && { where }),
        ...(sort && { sort }),
        ...(draft ? { draft: true } : {}),
        limit,
        page,
      })

      // Normalize media URLs in all documents
      const normalizedDocs = result.docs.map((doc: any) => normalizeMediaUrlsInDoc(doc))
      return NextResponse.json({ ...result, docs: normalizedDocs })
    }
  } catch (error: any) {
    console.error(`Payload GET error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch' },
      { status: error.status || 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const [first, second] = slug

  try {
    // Handle media uploads (FormData) - create Payload Media document
    if (first === "media") {
      const searchParams = request.nextUrl.searchParams;

      // Require projectId as a query param (no headers)
      const projectIdRaw = searchParams.get("projectId") || searchParams.get("project");
      const projectId =
        projectIdRaw && /^\d+$/.test(projectIdRaw) ? Number(projectIdRaw) : undefined;

      if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const media = await payload.create({
          collection: "media",
          data: {
            alt: file.name,
            project: projectId, // relationship field
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        } as any);

        const mediaData = media as any;

        return NextResponse.json(
          {
            id: mediaData.id,
            url: getMediaUrl(mediaData.filename),
            filename: mediaData.filename,
            project: mediaData.project,
            mimeType: mediaData.mimeType ?? mediaData.mime_type,
          },
          { status: 201 }
        );
      } catch (mediaError: any) {
        console.error("Media upload error:", mediaError);
        return NextResponse.json(
          { error: mediaError.message || "Failed to upload media" },
          { status: mediaError.status || 500 }
        );
      }
    }


    // Handle auth: /api/payload/users/logout (no body needed)
    if (first === 'users' && second === 'logout') {
      const response = NextResponse.json({ success: true })
      response.cookies.delete('payload-token')
      return response
    }

    // Handle restore: POST /api/payload/:collection/:id/restore
    // URL pattern: /api/payload/characters/2/restore => slug = ['characters', '2', 'restore']
    const third = slug[2]
    if (third === 'restore') {
      const collection = first
      const id = second

      if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 })
      }

      try {
        // In Payload 3.x, trashed documents are accessible via findByID with overrideAccess
        // We need to restore by updating _status from 'trashed' to 'draft'
        // First, try to find the trashed document
        let trashedDoc: any
        try {
          trashedDoc = await payload.findByID({
            collection: collection as any,
            id,
            overrideAccess: true,
            draft: true, // Trashed docs might be in draft state
          })
        } catch (findError: any) {
          // If not found with draft: true, try without (might be in trashed state)
          try {
            trashedDoc = await payload.findByID({
              collection: collection as any,
              id,
              overrideAccess: true,
            })
          } catch {
            // Document might be truly deleted or doesn't exist
            return NextResponse.json(
              { error: 'Document not found or already permanently deleted' },
              { status: 404 }
            )
          }
        }

        // Restore by updating _status back to 'draft' and clearing deletedAt
        // Note: We need to publish the change (not just save draft) for it to persist
        const restored = await payload.update({
          collection: collection as any,
          id,
          data: {
            _status: 'draft',
            deletedAt: null,
          } as any,
          overrideAccess: true,
          draft: false, // Publish the change, not just draft
        })

        const normalizedDoc = normalizeMediaUrlsInDoc(restored as any)
        return NextResponse.json(normalizedDoc)
      } catch (error: any) {
        console.error(`Payload RESTORE error:`, error)
        return NextResponse.json(
          { error: error.message || 'Failed to restore' },
          { status: error.status || 500 }
        )
      }
    }

    // Parse body only if not restore endpoint (restore doesn't need body)
    let body: any = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body or invalid JSON - use empty object
      body = {};
    }

    // Handle auth: /api/payload/users/login
    if (first === 'users' && second === 'login') {
      const result = await payload.login({
        collection: 'users',
        data: { email: body.email, password: body.password },
      })
      const response = NextResponse.json(result)
      // Set auth cookie
      if (result.token) {
        response.cookies.set('payload-token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      }
      return response
    }

    // Handle globals: /api/payload/globals/{slug}
    if (first === 'globals' && second) {
      const global = await payload.updateGlobal({
        slug: second as 'site-config' | 'sidebar-config',
        data: body,
      })
      return NextResponse.json(global)
    }

    // Regular collection create
    // Payload automatically generates integer IDs for all documents
    // Remove empty slug/ID fields to let Payload handle ID generation
    const cleanedData = { ...body };

    // Remove empty slug fields (server will generate IDs automatically)
    if (cleanedData.slug === '' || cleanedData.slug === null || cleanedData.slug === undefined) {
      delete cleanedData.slug;
    }
    if (cleanedData.spellId === '' || cleanedData.spellId === null || cleanedData.spellId === undefined) {
      delete cleanedData.spellId;
    }

    // For Effects collection, clean up blueprint to only include valid fields
    if (first === 'effects' && cleanedData.blueprint) {
      // Remove 'type' field from blueprint - it's not in Payload schema
      const { type, ...cleanBlueprint } = cleanedData.blueprint;
      cleanedData.blueprint = cleanBlueprint;
    }

    // For Projects collection, ensure name is provided (required field)
    if (first === Collections.Projects && !cleanedData.name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const doc = await payload.create({
      collection: first as any,
      data: cleanedData,
      overrideAccess: true, // Allow creation with proper validation
    })

    // Normalize media URLs in relationships
    const normalizedDoc = normalizeMediaUrlsInDoc(doc as any)
    return NextResponse.json(normalizedDoc, { status: 201 })
  } catch (error: any) {
    console.error(`Payload POST error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to create' },
      { status: error.status || 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const [collection, id] = slug

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    const body = await request.json()

    const doc = await payload.update({
      collection: collection as any,
      id,
      data: body,
    })

    // Normalize media URLs in relationships
    const normalizedDoc = normalizeMediaUrlsInDoc(doc as any)
    return NextResponse.json(normalizedDoc)
  } catch (error: any) {
    console.error(`Payload PUT error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to update' },
      { status: error.status || 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  // PATCH works same as PUT for Payload
  return PUT(request, { params })
}

// Collections that support soft-delete (have trash: true in their config)
const TRASHABLE_COLLECTIONS = [
  'characters', 'creatures', 'locations', 'objects',
  'lore', 'spells', 'runes', 'effects',
  'codex-entity-types', 'codex-entities'
]

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const [collection, id] = slug
  const { searchParams } = new URL(request.url)
  const forceDelete = searchParams.get('force') === 'true'

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    // If force=true, permanently delete regardless of trash setting
    if (forceDelete) {
      await payload.delete({
        collection: collection as any,
        id,
        overrideAccess: true,
      })
      return NextResponse.json({ success: true, permanentlyDeleted: true })
    }

    // For trashable collections, soft-delete by setting _status to 'trashed'
    // (Payload's delete() hard-deletes even with trash: true in some versions)
    if (TRASHABLE_COLLECTIONS.includes(collection)) {
      await payload.update({
        collection: collection as any,
        id,
        data: {
          _status: 'trashed',
        } as any,
        overrideAccess: true,
      })
      return NextResponse.json({ success: true, trashed: true })
    }

    // For non-trashable collections, actually delete
    await payload.delete({
      collection: collection as any,
      id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Payload DELETE error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete' },
      { status: error.status || 500 }
    )
  }
}
