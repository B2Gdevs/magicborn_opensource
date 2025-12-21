// lib/payload/access/helpers.ts
// Access control helpers for multi-tenant Payload setup

import type { AccessArgs } from 'payload/types'

/**
 * Check if user is superuser
 */
export function isSuperuser({ req }: AccessArgs): boolean {
  return req.user?.isSuperuser === true
}

/**
 * Get accessible project IDs for a user
 * Returns all project IDs if superuser, otherwise only projects they're a member of
 */
export async function getAccessibleProjectIds({ req }: AccessArgs): Promise<string[]> {
  if (isSuperuser({ req })) {
    // Superuser can access all projects
    const projects = await req.payload.find({
      collection: 'projects',
      limit: 1000, // Adjust as needed
    })
    return projects.docs.map(p => p.id)
  }

  if (!req.user?.id) {
    return []
  }

  // Get projects where user is a member
  const memberships = await req.payload.find({
    collection: 'projectMembers',
    where: {
      user: {
        equals: req.user.id,
      },
    },
    limit: 1000,
  })

  return memberships.docs.map(m => typeof m.project === 'string' ? m.project : m.project.id)
}

/**
 * Build where clause to filter by accessible projects
 */
export async function buildProjectWhereClause({ req }: AccessArgs): Promise<{ project: { in: string[] } } | {}> {
  const accessibleProjectIds = await getAccessibleProjectIds({ req })
  
  if (accessibleProjectIds.length === 0) {
    // No accessible projects - return empty result
    return { id: { equals: 'no-access' } } // This will return no results
  }

  return {
    project: {
      in: accessibleProjectIds,
    },
  }
}


