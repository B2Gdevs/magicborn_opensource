// app/api/payload/[...slug]/route.ts
// Payload CMS API route handler using Local API

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

async function getPayloadClient() {
  return await getPayload({ config })
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
        slug: second,
      })
      return NextResponse.json(global)
    }

    // Handle versions endpoint: /api/payload/{collection}/{id}/versions
    if (slug.length === 3 && third === 'versions') {
      const [collection, id] = slug
      const result = await payload.findVersions({
        collection,
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
        collection,
        id,
      })
      return NextResponse.json(doc)
    } else if (collection) {
      // Get collection
      const searchParams = request.nextUrl.searchParams
      const limit = parseInt(searchParams.get('limit') || '10')
      const page = parseInt(searchParams.get('page') || '1')
      
      const result = await payload.find({
        collection,
        limit,
        page,
      })
      return NextResponse.json(result)
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
    // Handle media uploads (FormData) - save to public/design/videos
    if (first === 'media') {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Sanitize filename
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const isVideo = file.type.startsWith('video/')
      const folder = isVideo ? 'videos' : 'images'
      const filePath = `public/design/${folder}/${sanitizedName}`
      
      // Write file to public folder
      const fs = await import('fs/promises')
      const path = await import('path')
      const fullPath = path.join(process.cwd(), filePath)
      await fs.writeFile(fullPath, buffer)
      
      const url = `/design/${folder}/${sanitizedName}`
      return NextResponse.json({ url, filename: sanitizedName }, { status: 201 })
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

    // Handle auth: /api/payload/users/logout
    if (first === 'users' && second === 'logout') {
      const response = NextResponse.json({ success: true })
      response.cookies.delete('payload-token')
      return response
    }

    // Handle globals: /api/payload/globals/{slug}
    if (first === 'globals' && second) {
      const global = await payload.updateGlobal({
        slug: second,
        data: body,
      })
      return NextResponse.json(global)
    }
    
    // Regular collection create
    const doc = await payload.create({
      collection: first,
      data: body,
    })
    
    return NextResponse.json(doc, { status: 201 })
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
      collection,
      id,
      data: body,
    })
    
    return NextResponse.json(doc)
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
      collection,
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
