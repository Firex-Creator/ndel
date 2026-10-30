import type { Field } from 'payload'

import { isStaffField } from '@/access'

/** URL slug, generated from another field when left blank. */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Used in the page address. Lowercase letters, numbers and hyphens.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const source = typeof value === 'string' && value ? value : (data?.[from] as string | undefined)
        return source
          ?.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      },
    ],
  },
})

/**
 * Publication and provenance controls shared by all public content.
 * "contentSource" keeps demonstration samples and unverified statements
 * separate from content the client has approved for publication.
 */
export const publicationFields: Field[] = [
  {
    name: 'published',
    type: 'checkbox',
    defaultValue: false,
    admin: { position: 'sidebar', description: 'Only published entries appear on the website.' },
  },
  {
    name: 'contentSource',
    label: 'Content status',
    type: 'select',
    required: true,
    defaultValue: 'pending',
    index: true,
    options: [
      { label: 'Verified: approved by NDEL for publication', value: 'verified' },
      { label: 'Pending: from existing website, awaiting NDEL verification', value: 'pending' },
      { label: 'Demonstration: sample content, not for publication', value: 'demonstration' },
    ],
    admin: {
      position: 'sidebar',
      description:
        'When the site goes live, only "Verified" content is shown publicly. Pending and Demonstration items are labelled on the demo site.',
    },
  },
  {
    name: 'verificationNote',
    type: 'textarea',
    access: { read: isStaffField },
    admin: {
      position: 'sidebar',
      description: 'Internal. What needs to be confirmed, by whom. Never shown publicly.',
    },
  },
]
