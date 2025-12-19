// lib/payload/seed/gameData.ts
// Seed game data (effects, spells, runes) from existing TypeScript definitions
// This ensures every Magicborn project starts with core game data

import type { Payload } from 'payload'
import { EFFECT_DEFS } from '@/lib/data/effects'
import { NAMED_SPELL_BLUEPRINTS } from '@/lib/data/namedSpells'
import { getRUNES } from '@/lib/packages/runes'
import { Collections } from '../constants'

/**
 * Seeds the Effects collection from EFFECT_DEFS
 */
export async function seedEffects(payload: Payload): Promise<void> {
  console.log('Seeding effects...')
  
  for (const [effectType, def] of Object.entries(EFFECT_DEFS)) {
    // Check if already exists
    const existing = await payload.find({
      collection: Collections.Effects,
      where: { effectType: { equals: effectType } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  Effect ${def.name} already exists, skipping`)
      continue
    }

    await payload.create({
      collection: Collections.Effects,
      data: {
        effectType: def.id,
        name: def.name,
        description: def.description,
        category: def.category,
        isBuff: def.isBuff,
        maxStacks: def.maxStacks,
        iconKey: def.iconKey,
        blueprint: {
          baseMagnitude: def.blueprint.baseMagnitude,
          baseDurationSec: def.blueprint.baseDurationSec,
          self: def.blueprint.self || false,
        },
        _status: 'published',
      },
    })
    console.log(`  Created effect: ${def.name}`)
  }
}

/**
 * Seeds the Spells collection from NAMED_SPELL_BLUEPRINTS
 */
export async function seedSpells(payload: Payload): Promise<void> {
  console.log('Seeding spells...')

  for (const spell of NAMED_SPELL_BLUEPRINTS) {
    // Check if already exists
    const existing = await payload.find({
      collection: Collections.Spells,
      where: { spellId: { equals: spell.id } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  Spell ${spell.name} already exists, skipping`)
      continue
    }

    await payload.create({
      collection: Collections.Spells,
      data: {
        spellId: spell.id,
        name: spell.name,
        description: spell.description,
        tags: spell.tags,
        requiredRunes: spell.requiredRunes,
        allowedExtraRunes: spell.allowedExtraRunes || null,
        minDamageFocus: spell.minDamageFocus
          ? {
              type: spell.minDamageFocus.type,
              ratio: spell.minDamageFocus.ratio,
            }
          : null,
        minTotalPower: spell.minTotalPower,
        requiresNamedSourceId: spell.requiresNamedSourceId || null,
        minTotalFamiliarityScore: spell.minTotalFamiliarityScore || null,
        minRuneFamiliarity: spell.minRuneFamiliarity || null,
        requiredFlags: spell.requiredFlags || null,
        effects: spell.effects || null,
        hidden: spell.hidden,
        hint: spell.hint,
        _status: 'published',
      },
    })
    console.log(`  Created spell: ${spell.name}`)
  }
}

/**
 * Seeds the Runes collection from hardcoded runes data
 * @param payload Payload instance
 * @param projectId Project ID to associate runes with
 */
export async function seedRunes(payload: Payload, projectId: number): Promise<void> {
  console.log(`Seeding runes for project ${projectId}...`)
  
  const hardcodedRunes = getRUNES()
  const runeList = Object.values(hardcodedRunes)
  
  for (const rune of runeList) {
    // Check if already exists for this project
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

    if (existing.docs.length > 0) {
      console.log(`  Rune ${rune.code} (${rune.concept}) already exists for project ${projectId}, skipping`)
      continue
    }

    await payload.create({
      collection: Collections.Runes,
      data: {
        project: projectId,
        code: rune.code,
        concept: rune.concept,
        powerFactor: rune.powerFactor,
        controlFactor: rune.controlFactor,
        instabilityBase: rune.instabilityBase,
        tags: rune.tags,
        manaCost: rune.manaCost,
        damage: rune.damage || null,
        ccInstant: rune.ccInstant || null,
        pen: rune.pen || null,
        effects: rune.effects || null,
        overchargeEffects: rune.overchargeEffects || null,
        dotAffinity: rune.dotAffinity || null,
        _status: 'published',
      },
    })
    console.log(`  Created rune: ${rune.code} (${rune.concept})`)
  }
}

/**
 * Run all game data seeds
 */
export async function seedGameData(payload: Payload): Promise<void> {
  console.log('=== Seeding Magicborn Game Data ===')
  
  await seedEffects(payload)
  await seedSpells(payload)
  
  console.log('=== Game Data Seeding Complete ===')
}

