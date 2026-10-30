import type { CollectionConfig } from 'payload'

import { canEditContent, publishedContent } from '@/access'
import { publicationFields, slugField } from '@/fields/content'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project case study', plural: 'Project case studies' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectStatus', 'published', 'contentSource'],
    group: 'Website content',
  },
  defaultSort: '-updatedAt',
  access: {
    read: publishedContent,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'summary', type: 'textarea', required: true },
    { name: 'services', type: 'relationship', relationTo: 'services', hasMany: true, required: true },
    {
      name: 'projectStatus',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'In progress', value: 'in-progress' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'location', type: 'text' },
        { name: 'period', type: 'text', admin: { description: 'For example "Q2 2025".' } },
      ],
    },
    {
      name: 'clientName',
      type: 'text',
      admin: { description: 'Only name a client with their written permission. Leave blank otherwise.' },
    },
    { name: 'challenge', type: 'textarea', required: true },
    { name: 'scope', type: 'textarea', required: true },
    { name: 'approach', type: 'textarea', required: true },
    {
      name: 'outcome',
      type: 'textarea',
      required: true,
      admin: { description: 'State only outcomes the client can evidence.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: { description: 'Optional. YouTube or Vimeo link, or a direct .mp4 URL. Never autoplays.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Show on the home page.' },
    },
    ...publicationFields,
  ],
}
