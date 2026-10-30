import type { GlobalConfig } from 'payload'

import { canEditContent, isStaffField } from '@/access'

export const Company: GlobalConfig = {
  slug: 'company',
  label: 'Company profile',
  admin: { group: 'Website content' },
  access: { read: () => true, update: canEditContent },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'displayName', type: 'text', required: true, defaultValue: 'NDEL' },
        {
          name: 'registeredName',
          type: 'text',
          admin: { description: 'Full registered business name. Shown publicly only once confirmed.' },
        },
      ],
    },
    {
      name: 'registeredNameConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Tick once NDEL has confirmed the registered name (for example against CAC records).' },
    },
    {
      name: 'overview',
      type: 'array',
      label: 'Company overview paragraphs',
      fields: [{ name: 'paragraph', type: 'textarea', required: true }],
    },
    {
      name: 'overviewStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Verified', value: 'verified' },
        { label: 'Pending NDEL verification', value: 'pending' },
      ],
    },
    {
      name: 'operatingApproach',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'credentials',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      admin: {
        description:
          'Certificates and accreditations to list on the About page. Only published, verified documents are shown.',
      },
    },
    {
      name: 'companyProfile',
      label: 'Company profile download',
      type: 'relationship',
      relationTo: 'documents',
      admin: { description: 'The home page download button appears only when this is set and published.' },
    },
    {
      name: 'claimsAwaitingEvidence',
      type: 'array',
      access: { read: isStaffField },
      admin: {
        description:
          'Internal. Claims found on the previous website that must not be published until evidence is supplied.',
      },
      fields: [
        { name: 'claim', type: 'text', required: true },
        { name: 'evidenceRequired', type: 'text' },
      ],
    },
  ],
}
