import type { CollectionConfig } from 'payload'

import { canEditContent, publishedContent } from '@/access'
import { publicationFields, slugField } from '@/fields/content'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Insight article', plural: 'Insight articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'authorName', 'publishedDate', 'published', 'contentSource'],
    group: 'Website content',
  },
  defaultSort: '-publishedDate',
  access: {
    read: publishedContent,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'body', type: 'richText', required: true },
    {
      type: 'row',
      fields: [
        { name: 'authorName', type: 'text', required: true },
        {
          name: 'author',
          type: 'relationship',
          relationTo: 'team-members',
          admin: { description: 'Optional link to a team profile.' },
        },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'relatedServices', type: 'relationship', relationTo: 'services', hasMany: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    ...publicationFields,
  ],
}
