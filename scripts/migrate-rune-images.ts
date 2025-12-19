// scripts/migrate-rune-images.ts
// One-time migration script to update existing runes with images from public/design/images/game-icons/runes/
// Run: npx tsx scripts/migrate-rune-images.ts [projectId]
// Example: npx tsx scripts/migrate-rune-images.ts 1

import { getPayload } from 'payload'
import config from '../payload.config'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'
import { getRUNES } from '@/lib/packages/runes'
import { Collections } from '../lib/payload/constants'

async function migrateRuneImages() {
  const projectId = process.argv[2] ? parseInt(process.argv[2], 10) : 1

  if (isNaN(projectId)) {
    console.error('Invalid project ID. Usage: npx tsx scripts/migrate-rune-images.ts [projectId]')
    process.exit(1)
  }

  console.log(`=== Migrating Rune Images for Project ${projectId} ===\n`)

  const payload = await getPayload({ config })
  const hardcodedRunes = getRUNES()
  const runeList = Object.values(hardcodedRunes)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const rune of runeList) {
    try {
      // Find existing rune in Payload
      const existing = await payload.find({
        collection: Collections.Runes,
        where: {
          and: [
            { code: { equals: rune.code } },
            { project: { equals: projectId } },
          ],
        },
        limit: 1,
      })

      if (existing.docs.length === 0) {
        console.log(`  ⚠️  Rune ${rune.code} (${rune.concept}) not found in Payload, skipping`)
        skipped++
        continue
      }

      const existingRune = existing.docs[0]

      // Check if image exists in public/design/images/game-icons/runes/
      // Try imagePath first, then fallback to {code}.png, {code}.webp, etc.
      let imagePath: string | null = null
      const runesDir = path.join(process.cwd(), 'public', 'design', 'images', 'game-icons', 'runes')
      
      if (rune.imagePath) {
        const candidatePath = path.join(runesDir, path.basename(rune.imagePath))
        if (existsSync(candidatePath)) {
          imagePath = candidatePath
        }
      }
      
      // If no imagePath or file doesn't exist, try common patterns
      if (!imagePath) {
        const extensions = ['.png', '.webp', '.jpg', '.jpeg', '.svg', '.gif']
        for (const ext of extensions) {
          const candidatePath = path.join(runesDir, `${rune.code}${ext}`)
          if (existsSync(candidatePath)) {
            imagePath = candidatePath
            break
          }
        }
      }

      if (!imagePath || !existsSync(imagePath)) {
        console.log(`  ⚠️  Image not found for ${rune.code} (${rune.concept}), skipping`)
        skipped++
        continue
      }

      // Read and upload image to Payload Media
      const fileBuffer = await readFile(imagePath)
      const fileStats = await stat(imagePath)
      const ext = path.extname(imagePath).toLowerCase()

      const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      }
      const mimetype = mimeTypes[ext] || 'image/png'

      let mediaId: number

      // Check if rune already has an image - if so, we'll replace it
      if (existingRune.image) {
        const existingImageId = typeof existingRune.image === 'object' 
          ? existingRune.image.id 
          : existingRune.image
        
        // Delete old media if it exists
        try {
          await payload.delete({
            collection: Collections.Media,
            id: existingImageId,
          })
          console.log(`    Deleted old image for ${rune.code}`)
        } catch (error) {
          // Media might not exist, continue anyway
        }
      }

      // Upload to Payload Media
      const media = await payload.create({
        collection: Collections.Media,
        data: {
          alt: `${rune.concept} rune icon`,
        },
        file: {
          data: fileBuffer,
          mimetype,
          name: path.basename(imagePath),
          size: fileStats.size,
        },
      } as any)

      mediaId = (media as any).id

      // Update rune with image (always update, even if it had one before)
      await payload.update({
        collection: Collections.Runes,
        id: existingRune.id,
        data: {
          image: mediaId,
        },
      })

      console.log(`  ✓ ${existingRune.image ? 'Updated' : 'Migrated'} image for ${rune.code} (${rune.concept}): ${path.basename(imagePath)}`)
      migrated++
    } catch (error: any) {
      console.error(`  ✗ Error migrating ${rune.code} (${rune.concept}):`, error.message)
      errors++
    }
  }

  console.log(`\n=== Migration Complete ===`)
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Errors: ${errors}`)

  process.exit(0)
}

migrateRuneImages().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})

