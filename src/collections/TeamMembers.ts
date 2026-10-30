import type { CollectionConfig } from 'payload'

import { canEditContent, publishedContent } from '@/access'
import { publicationFields } from '@/fields/content'

export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team profile', plural: 'Team profiles' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'published', 'contentSource'],
    group: 'Website content',
  },
  defaultSort: 'order',
  access: {
    read: publishedContent,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'position', type: 'text', required: true },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    ...publicationFields,
  ],
}
