import type { GlobalConfig } from 'payload'

import { canEditContent } from '@/access'

const verifiedCheckbox = {
  name: 'verified',
  type: 'checkbox',
  defaultValue: false,
  admin: { description: 'Confirmed correct by NDEL.' },
} as const

export const ContactInfo: GlobalConfig = {
  slug: 'contact-info',
  label: 'Contact information',
  admin: { group: 'Website content' },
  access: { read: () => true, update: canEditContent },
  fields: [
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Head office' },
        { name: 'lines', type: 'textarea' },
        verifiedCheckbox,
      ],
    },
    {
      name: 'phones',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'Main line' },
            {
              name: 'number',
              type: 'text',
              required: true,
              admin: { description: 'International format, for example +234 703 000 0000.' },
            },
          ],
        },
        verifiedCheckbox,
      ],
    },
    {
      name: 'emails',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', defaultValue: 'General enquiries' },
            { name: 'email', type: 'email', required: true },
          ],
        },
        verifiedCheckbox,
      ],
    },
    {
      name: 'hours',
      label: 'Office hours',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'days', type: 'text', required: true },
            { name: 'time', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      name: 'map',
      type: 'group',
      admin: { description: 'The map is shown only when the location has been verified on site.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'latitude', type: 'number' },
            { name: 'longitude', type: 'number' },
          ],
        },
        {
          name: 'locationVerified',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Tick only after confirming the pin location with NDEL.' },
        },
      ],
    },
  ],
}
