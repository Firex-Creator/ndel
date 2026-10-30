import type { Access, FieldAccess, Where } from 'payload'

import { showUnverifiedContent } from '@/lib/env'

type Role = 'admin' | 'editor'

type StaffUser = { id: number | string; roles?: Role[] | null; collection?: string }

const staff = (user: unknown): StaffUser | null => {
  const u = user as StaffUser | null
  return u && u.collection === 'users' ? u : null
}

export const hasRole = (user: unknown, role: Role) => Boolean(staff(user)?.roles?.includes(role))

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isStaff: Access = ({ req: { user } }) => Boolean(staff(user))

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

export const isStaffField: FieldAccess = ({ req: { user } }) => Boolean(staff(user))

/** Admins and editors manage website content. */
export const canEditContent: Access = ({ req: { user } }) =>
  hasRole(user, 'admin') || hasRole(user, 'editor')

/**
 * Public read access for website content. Staff see everything; visitors see
 * published entries, restricted to verified content when the site is live.
 */
export const publishedContent: Access = ({ req: { user } }) => {
  if (staff(user)) return true
  const where: Where = { published: { equals: true } }
  if (!showUnverifiedContent) {
    return { and: [where, { contentSource: { equals: 'verified' } }] }
  }
  return where
}

/** Admins see every enquiry; editors only those assigned to them. */
export const enquiryAccess: Access = ({ req: { user } }) => {
  const u = staff(user)
  if (!u) return false
  if (u.roles?.includes('admin')) return true
  if (u.roles?.includes('editor')) return { assignedTo: { equals: u.id } }
  return false
}

/** Attachment access follows the parent enquiry's assignment. */
export const enquiryAttachmentAccess: Access = ({ req: { user } }) => {
  const u = staff(user)
  if (!u) return false
  if (u.roles?.includes('admin')) return true
  if (u.roles?.includes('editor')) return { 'enquiry.assignedTo': { equals: u.id } }
  return false
}
