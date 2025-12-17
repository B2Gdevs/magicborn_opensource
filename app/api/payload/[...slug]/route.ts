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
  
  // Parse slug: e.g., ['projects'] or ['projects', '123']
  const [collection, id] = slug
  
  try {
    if (id) {
      // Get single document
      const doc = await payload.findByID({
        collection,
        id,
      })
      return NextResponse.json(doc)
    } else {
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
  const [collection] = slug
  
  try {
    const body = await request.json()
    
    const doc = await payload.create({
      collection,
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
