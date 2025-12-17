// app/admin/[[...segments]]/route.ts
// Payload Admin UI route handler

import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params
  const payload = await getPayload({ config })
  return payload.router(request as any, { slug: ['admin', ...segments] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params
  const payload = await getPayload({ config })
  return payload.router(request as any, { slug: ['admin', ...segments] })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params
  const payload = await getPayload({ config })
  return payload.router(request as any, { slug: ['admin', ...segments] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params
  const payload = await getPayload({ config })
  return payload.router(request as any, { slug: ['admin', ...segments] })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ segments?: string[] }> }
) {
  const { segments = [] } = await params
  const payload = await getPayload({ config })
  return payload.router(request as any, { slug: ['admin', ...segments] })
}

