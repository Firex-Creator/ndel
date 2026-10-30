import type { GlobalConfig } from 'payload'

import { canEditContent } from '@/access'

export const SafetyQuality: GlobalConfig = {
  slug: 'safety-quality',
  label: 'Safety and quality',
  admin: { group: 'Website content' },
  access: { read: () => true, update: canEditContent },
  fields: [
    { name: 'introduction', type: 'textarea' },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Policy area', plural: 'Policy areas' },
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'awaiting',
          options: [
            { label: 'Verified: supported by an NDEL document', value: 'verified' },
            { label: 'Awaiting NDEL policy document', value: 'awaiting' },
          ],
          admin: {
            description: 'Areas awaiting a document are labelled publicly and hidden when the site goes live.',
          },
        },
        { name: 'document', type: 'relationship', relationTo: 'documents' },
      ],
    },
  ],
}
