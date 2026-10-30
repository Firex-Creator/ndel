import type { CollectionConfig } from 'payload'

import { enquiryAttachmentAccess, isAdmin } from '@/access'

export const ENQUIRY_ATTACHMENT_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
] as const

export const ENQUIRY_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

/**
 * Private supporting documents. Files are stored outside the public web root and
 * served only through Payload's file route, which applies the read access below.
 */
export const EnquiryAttachments: CollectionConfig = {
  slug: 'enquiry-attachments',
  labels: { singular: 'Enquiry attachment', plural: 'Enquiry attachments' },
  admin: {
    group: 'Enquiries',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'enquiry', 'filesize', 'createdAt'],
  },
  access: {
    create: () => false,
    read: enquiryAttachmentAccess,
    update: () => false,
    delete: isAdmin,
  },
  upload: {
    staticDir: 'private-uploads/enquiries',
    mimeTypes: [...ENQUIRY_ATTACHMENT_MIME_TYPES],
    // No image resizing or admin thumbnails for private files.
    disableLocalStorage: false,
    displayPreview: false,
  },
  fields: [
    {
      name: 'enquiry',
      type: 'relationship',
      relationTo: 'enquiries',
      index: true,
      admin: { readOnly: true },
    },
  ],
}
