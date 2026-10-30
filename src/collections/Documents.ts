import type { CollectionConfig } from 'payload'

import { canEditContent, publishedContent } from '@/access'
import { publicationFields } from '@/fields/content'

const isCertificate = (data: Record<string, unknown> | undefined) => data?.category === 'certificate'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Company document', plural: 'Company documents' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'published', 'contentSource'],
    group: 'Website content',
    description:
      'Downloadable PDFs: company profile, policies, certificates. Upload only documents NDEL has supplied and approved.',
  },
  access: {
    read: publishedContent,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  upload: {
    staticDir: 'documents',
    mimeTypes: ['application/pdf'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Company profile', value: 'company-profile' },
        { label: 'Policy', value: 'policy' },
        { label: 'Certificate or accreditation', value: 'certificate' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'row',
      admin: { condition: isCertificate },
      fields: [
        { name: 'issuingBody', type: 'text' },
        { name: 'certificateNumber', type: 'text' },
        { name: 'validUntil', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
      ],
    },
    ...publicationFields,
  ],
}
