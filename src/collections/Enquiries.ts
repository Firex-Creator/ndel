import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { enquiryAccess, isAdmin, isAdminField } from '@/access'

type Note = { id?: string | null; note?: string; author?: unknown; addedAt?: string }

/**
 * Internal notes are append-only: existing notes keep their original text,
 * author and timestamp; new notes are stamped with the current user and time.
 */
const stampNotes: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  if (!Array.isArray(data.internalNotes)) return data
  const previous = new Map<string, Note>(
    ((originalDoc?.internalNotes as Note[] | undefined) ?? []).filter((n) => n.id).map((n) => [n.id!, n]),
  )
  const kept = (data.internalNotes as Note[]).map((note) => {
    const original = note.id ? previous.get(note.id) : undefined
    if (original) return original
    // Staff edits are always attributed to the signed-in user; system writes keep their values.
    return {
      ...note,
      author: req.user ? req.user.id : note.author,
      addedAt: req.user || !note.addedAt ? new Date().toISOString() : note.addedAt,
    }
  })
  // Notes cannot be deleted by removing them from the list.
  const keptIds = new Set(kept.map((n) => n.id))
  const removed = [...previous.values()].filter((n) => !keptIds.has(n.id))
  data.internalNotes = [...removed, ...kept]
  return data
}

const submitted = { readOnly: true } as const

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'name', 'company', 'serviceLabel', 'status', 'assignedTo', 'createdAt'],
    listSearchableFields: ['reference', 'name', 'company', 'email', 'projectLocation'],
    group: 'Enquiries',
    description:
      'Project enquiries submitted through the website. Administrators see all enquiries; editors see enquiries assigned to them.',
  },
  defaultSort: '-createdAt',
  access: {
    // Enquiries are created only by the website's server action (overrideAccess),
    // never through the public REST API.
    create: () => false,
    read: enquiryAccess,
    update: enquiryAccess,
    delete: isAdmin,
  },
  hooks: { beforeChange: [stampNotes] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Enquiry',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, admin: submitted },
                { name: 'company', type: 'text', required: true, admin: submitted },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'Work email', type: 'email', required: true, admin: submitted },
                { name: 'telephone', type: 'text', admin: submitted },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'service', type: 'relationship', relationTo: 'services', admin: submitted },
                {
                  name: 'serviceLabel',
                  label: 'Service required',
                  type: 'text',
                  required: true,
                  admin: { ...submitted, description: 'As selected at the time of submission.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'projectLocation', type: 'text', required: true, admin: submitted },
                {
                  name: 'anticipatedStart',
                  type: 'date',
                  admin: { ...submitted, date: { pickerAppearance: 'dayOnly' } },
                },
              ],
            },
            { name: 'description', label: 'Project description', type: 'textarea', required: true, admin: submitted },
            {
              name: 'attachment',
              label: 'Supporting document',
              type: 'upload',
              relationTo: 'enquiry-attachments',
              admin: submitted,
            },
            {
              name: 'sourcePage',
              type: 'text',
              admin: { ...submitted, description: 'Page the visitor started the enquiry from.' },
            },
          ],
        },
        {
          label: 'Internal notes',
          fields: [
            {
              name: 'internalNotes',
              type: 'array',
              labels: { singular: 'Note', plural: 'Notes' },
              admin: { description: 'Visible to staff only. Notes are kept permanently once saved.' },
              fields: [
                { name: 'note', type: 'textarea', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
                    { name: 'addedAt', type: 'date', admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'reference',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewing', value: 'reviewing' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      label: 'Assigned staff member',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      access: { update: isAdminField },
      admin: { position: 'sidebar', description: 'Only administrators can change the assignment.' },
    },
    {
      name: 'emailNotification',
      type: 'select',
      defaultValue: 'not-configured',
      options: [
        { label: 'Not sent: email not configured', value: 'not-configured' },
        { label: 'Sent to staff inbox', value: 'sent' },
        { label: 'Failed to send', value: 'failed' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  timestamps: true,
}
