import type { CollectionConfig, Field } from 'payload'

import { canEditContent, publishedContent } from '@/access'
import { publicationFields, slugField } from '@/fields/content'

const listField = (name: string, label: string): Field => ({
  name,
  label,
  type: 'array',
  fields: [{ name: 'item', type: 'text', required: true }],
})

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'published', 'contentSource', 'order'],
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
    { name: 'title', type: 'text', required: true },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two sentences shown on service cards.' },
    },
    { name: 'overview', type: 'textarea', admin: { description: 'Opening paragraph on the service page.' } },
    listField('problems', 'Client problems addressed'),
    listField('scope', 'Scope of work'),
    listField('applications', 'Typical applications'),
    {
      name: 'process',
      label: 'Delivery process',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    { name: 'metaDescription', type: 'textarea', maxLength: 170 },
    { name: 'order', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    ...publicationFields,
  ],
}
