// lib/payload/collections/AIGenerations.ts
// Track AI-generated content for review workflow

import type { CollectionConfig } from 'payload'
import { Collections, AI_GENERATION_STATUS_OPTIONS, AIGenerationStatus } from '../constants'
import { isSuperuser, isEditorOrAbove, isAIAgent } from '../access/roles'

export const AIGenerations: CollectionConfig = {
  slug: Collections.AIGenerations,
  admin: {
    useAsTitle: 'prompt',
    group: 'AI',
  },
  access: {
    read: isEditorOrAbove,
    create: ({ req }) => isEditorOrAbove({ req }) || isAIAgent({ req }),
    update: isEditorOrAbove,
    delete: isSuperuser,
  },
  fields: [
    {
      name: 'prompt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'The prompt used to generate content',
      },
    },
    {
      name: 'model',
      type: 'text',
      admin: {
        description: 'AI model used (e.g., llama3, gpt-4)',
      },
    },
    {
      name: 'targetCollection',
      type: 'select',
      options: [
        { label: 'Scenes', value: Collections.Scenes },
        { label: 'Characters', value: Collections.Characters },
        { label: 'Lore', value: Collections.Lore },
        { label: 'Locations', value: Collections.Locations },
        { label: 'Spells', value: Collections.Spells },
      ],
      admin: {
        description: 'Collection this generation targets',
      },
    },
    {
      name: 'targetDocId',
      type: 'text',
      admin: {
        description: 'ID of the document being edited (if editing existing)',
      },
    },
    {
      name: 'generatedContent',
      type: 'json',
      required: true,
      admin: {
        description: 'The AI-generated content',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: AI_GENERATION_STATUS_OPTIONS as any,
      defaultValue: AIGenerationStatus.Pending,
      required: true,
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: Collections.Users,
    },
    {
      name: 'reviewNotes',
      type: 'textarea',
    },
    {
      name: 'createdDocId',
      type: 'text',
      admin: {
        description: 'ID of document created from this generation (if accepted)',
      },
    },
  ],
}





