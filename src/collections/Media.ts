import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image', plural: 'Images' },
  admin: { group: 'Website content', defaultColumns: ['filename', 'alt', 'licence'] },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 480 },
      { name: 'card', width: 960 },
      { name: 'hero', width: 1920 },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
  },
  fields: [
    {
      name: 'alt',
      label: 'Alternative text',
      type: 'text',
      required: true,
      admin: { description: 'Describe what the image shows for screen-reader users.' },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source, if a credit is required.' },
    },
    {
      name: 'licence',
      type: 'select',
      required: true,
      defaultValue: 'unconfirmed',
      options: [
        { label: 'NDEL-owned photography', value: 'owned' },
        { label: 'Licensed stock (licence on file)', value: 'licensed' },
        { label: 'Usage rights unconfirmed', value: 'unconfirmed' },
      ],
      admin: { description: 'Do not publish images with unconfirmed usage rights.' },
    },
  ],
}
