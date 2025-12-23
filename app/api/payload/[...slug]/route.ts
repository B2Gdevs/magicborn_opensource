// app/api/payload/[...slug]/route.ts
// Payload CMS API route handler using Local API

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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
  if (!doc || typeof doc !== 'object') return doc
  
  const normalized = { ...doc }
  
  // Normalize direct media document URLs - just use filename
  if (normalized.filename) {
    normalized.url = getMediaUrl(normalized.filename)
  }
  
  // Normalize image relationship URLs (common field name)
  if (normalized.image) {
    if (typeof normalized.image === 'object' && normalized.image.filename) {
      normalized.image = {
        ...normalized.image,
        url: getMediaUrl(normalized.image.filename),
      }
    }
  }
  
  // Normalize featuredImage relationship URLs
  if (normalized.featuredImage) {
    if (typeof normalized.featuredImage === 'object' && normalized.featuredImage.filename) {
      normalized.featuredImage = {
        ...normalized.featuredImage,
        url: getMediaUrl(normalized.featuredImage.filename),
      }
    }
  }
  
  // Normalize landmarkIcon relationship URLs
  if (normalized.landmarkIcon) {
    if (typeof normalized.landmarkIcon === 'object' && normalized.landmarkIcon.filename) {
      normalized.landmarkIcon = {
        ...normalized.landmarkIcon,
        url: getMediaUrl(normalized.landmarkIcon.filename),
      }
    }
  }
  
  return normalized
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params
  const payload = await getPayloadClient()
  
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
      const searchParams = request.nextUrl.searchParams
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
    if (first === 'media') {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Convert File to Buffer for Payload Local API
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Create Media document in Payload
      // Payload 3.x Local API expects file object with data, mimetype, name, size
      try {
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: file.name,
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        } as any)
        
        const mediaData = media as any
        // Just construct URL from filename - ignore Payload's generated URL
        return NextResponse.json({ 
          id: mediaData.id,
          url: getMediaUrl(mediaData.filename),
          filename: mediaData.filename,
        }, { status: 201 })
      } catch (mediaError: any) {
        console.error('Media upload error:', mediaError)
        return NextResponse.json(
          { error: mediaError.message || 'Failed to upload media' },
          { status: mediaError.status || 500 }
        )
      }
    }

    // Handle auth: /api/payload/users/logout (no body needed)
    if (first === 'users' && second === 'logout') {
      const response = NextResponse.json({ success: true })
      response.cookies.delete('payload-token')
      return response
    }

    const body = await request.json()
    
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
    const doc = await payload.create({
      collection: first as any,
      data: body,
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

export async function DELETE(
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
    await payload.delete({
      collection: collection as any,
      id,
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
