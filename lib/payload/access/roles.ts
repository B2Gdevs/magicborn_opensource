// lib/payload/access/roles.ts
// Role-based access control helpers using constants

import type { PayloadRequest } from 'payload'
import { UserRole } from '../constants'

type AccessArgs = { req: PayloadRequest }

// ============================================
// ROLE CHECKS
// ============================================

export const isSuperuser = ({ req }: AccessArgs): boolean =>
  req.user?.role === UserRole.Superuser || req.user?.isSuperuser === true

export const isEditor = ({ req }: AccessArgs): boolean =>
  req.user?.role === UserRole.Editor

export const isContributor = ({ req }: AccessArgs): boolean =>
  req.user?.role === UserRole.Contributor

export const isAIAgent = ({ req }: AccessArgs): boolean =>
  req.user?.role === UserRole.AIAgent

// ============================================
// ROLE HIERARCHIES
// ============================================

export const isEditorOrAbove = ({ req }: AccessArgs): boolean =>
  [UserRole.Superuser, UserRole.Editor].includes(req.user?.role as UserRole)

export const isContributorOrAbove = ({ req }: AccessArgs): boolean =>
  [UserRole.Superuser, UserRole.Editor, UserRole.Contributor].includes(
    req.user?.role as UserRole
  )

export const canCreateContent = ({ req }: AccessArgs): boolean =>
  [UserRole.Superuser, UserRole.Editor, UserRole.Contributor, UserRole.AIAgent].includes(
    req.user?.role as UserRole
  )

// ============================================
// ENVIRONMENT CHECKS
// ============================================

export const isProduction = (): boolean =>
  process.env.NODE_ENV === 'production'

export const isReadOnlyMode = (): boolean =>
  process.env.PAYLOAD_READONLY === 'true'

// ============================================
// COMBINED ACCESS RULES
// ============================================

/**
 * Can edit in current environment
 * In production with PAYLOAD_READONLY, only superuser can edit
 */
export const canEditInEnvironment = ({ req }: AccessArgs): boolean => {
  if (isReadOnlyMode()) {
    return isSuperuser({ req })
  }
  return isEditorOrAbove({ req })
}

/**
 * Public read access - returns query for published content only
 */
export const publicReadAccess = ({ req }: AccessArgs) => {
  // Authenticated users with edit rights see everything
  if (req.user && isContributorOrAbove({ req })) {
    return true
  }
  // Public only sees published
  return {
    _status: { equals: 'published' },
  }
}

/**
 * Public read with isPublic flag check
 */
export const publicReadWithFlag = ({ req }: AccessArgs) => {
  if (req.user && isContributorOrAbove({ req })) {
    return true
  }
  return {
    and: [
      { _status: { equals: 'published' } },
      { isPublic: { equals: true } },
    ],
  }
}

