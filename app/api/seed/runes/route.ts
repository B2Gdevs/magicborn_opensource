// app/api/seed/runes/route.ts
// API route to seed runes for a project
// POST /api/seed/runes?projectId=1

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedRunes } from '@/lib/payload/seed/gameData'

async function getPayloadClient() {
  return await getPayload({ config })
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = parseInt(searchParams.get('projectId') || '1', 10)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()
    await seedRunes(payload, projectId)

    return NextResponse.json({
      success: true,
      message: `Runes seeded for project ${projectId}`,
    })
  } catch (error: any) {
    console.error('Failed to seed runes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to seed runes' },
      { status: 500 }
    )
  }
}

