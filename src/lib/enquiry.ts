import 'server-only'

import { randomInt } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { commitTransaction, createLocalReq, initTransaction, killTransaction, ValidationError } from 'payload'
import { z } from 'zod'

import {
  ENQUIRY_ATTACHMENT_MAX_BYTES,
  ENQUIRY_ATTACHMENT_MIME_TYPES,
} from '@/collections/EnquiryAttachments'
import { isEmailConfigured, isS3Configured, siteUrl } from '@/lib/env'
import { getPayloadClient } from '@/lib/payload'

export const OTHER_SERVICE = 'other'

export type EnquiryFieldErrors = Partial<Record<keyof EnquiryInput | 'attachment' | 'form', string>>

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'error'; message: string; fieldErrors: EnquiryFieldErrors; values: Record<string, string> }
  | { status: 'success'; reference: string; emailStatus: 'sent' | 'not-configured' | 'failed' }

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined))

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(120, 'Name is too long.'),
  company: z.string().trim().min(2, 'Enter your company or organisation.').max(160, 'Company name is too long.'),
  email: z
    .string()
    .trim()
    .max(200)
    .pipe(z.email({ error: 'Enter a valid email address, for example name@company.com.' })),
  telephone: optionalText(30).refine((v) => !v || /^[+()\d\s.-]{7,30}$/.test(v), {
    message: 'Enter a valid telephone number, using digits, spaces and an optional leading +.',
  }),
  service: z.string().trim().min(1, 'Select the service you need.'),
  projectLocation: z
    .string()
    .trim()
    .min(2, 'Enter the project location, for example a field, port or region.')
    .max(160, 'Location is too long.'),
  description: z
    .string()
    .trim()
    .min(30, 'Describe the project in at least 30 characters so our engineers can respond usefully.')
    .max(5000, 'Project description must be 5,000 characters or fewer.'),
  anticipatedStart: optionalText(10).refine(
    (v) => {
      if (!v) return true
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
      const date = new Date(`${v}T00:00:00Z`)
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      return !Number.isNaN(date.getTime()) && date >= today
    },
    { message: 'Enter a valid start date that is today or later.' },
  ),
  consent: z.literal('on', { error: 'Please confirm we may use these details to respond to your enquiry.' }),
  sourcePage: optionalText(300).refine((v) => !v || /^\/[\w\-/]*$/.test(v), { message: 'Invalid source page.' }),
})

export type EnquiryInput = z.infer<typeof enquirySchema>

/* ----------------------------- attachments ----------------------------- */

const EXTENSION_TYPES: Record<string, (typeof ENQUIRY_ATTACHMENT_MIME_TYPES)[number]> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

const startsWith = (buf: Buffer, bytes: number[]) => bytes.every((b, i) => buf[i] === b)

/** Confirms the file content matches its extension rather than trusting the browser's MIME type. */
const signatureMatches = (ext: string, buf: Buffer) => {
  switch (ext) {
    case 'pdf':
      return startsWith(buf, [0x25, 0x50, 0x44, 0x46]) // %PDF
    case 'png':
      return startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    case 'jpg':
    case 'jpeg':
      return startsWith(buf, [0xff, 0xd8, 0xff])
    case 'docx':
    case 'xlsx':
      return startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) // ZIP container
    default:
      return false
  }
}

type CheckedFile = { data: Buffer; mimetype: string; name: string; size: number }

export const ATTACHMENT_HINT = 'PDF, Word (.docx), Excel (.xlsx), JPG or PNG, up to 10 MB.'

async function checkAttachment(file: FormDataEntryValue | null): Promise<CheckedFile | null | { error: string }> {
  if (!file || typeof file === 'string' || file.size === 0) return null
  if (file.size > ENQUIRY_ATTACHMENT_MAX_BYTES) {
    return { error: `The file is larger than 10 MB. Accepted: ${ATTACHMENT_HINT}` }
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const mimetype = EXTENSION_TYPES[ext]
  if (!mimetype) return { error: `This file type is not accepted. Accepted: ${ATTACHMENT_HINT}` }
  const data = Buffer.from(await file.arrayBuffer())
  if (!signatureMatches(ext, data)) {
    return { error: 'The file content does not match its extension. Please upload the original document.' }
  }
  const base = file.name
    .slice(0, file.name.length - ext.length - 1)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  return { data, mimetype, name: `${base || 'document'}.${ext}`, size: file.size }
}

/* ------------------------------ references ----------------------------- */

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O or 1/I

export function generateReference(now = new Date()) {
  const date = now.toISOString().slice(2, 10).replace(/-/g, '')
  let suffix = ''
  for (let i = 0; i < 5; i++) suffix += REF_ALPHABET[randomInt(REF_ALPHABET.length)]
  return `NDEL-${date}-${suffix}`
}

/* ------------------------------ rate limit ----------------------------- */

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const recent = new Map<string, number[]>()

/** Simple per-instance limiter. Production behind multiple instances should use a shared store. */
export function isRateLimited(key: string) {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  recent.set(key, hits)
  return hits.length > MAX_PER_WINDOW
}

/* ------------------------------- submit -------------------------------- */

const valuesFrom = (formData: FormData) => {
  const values: Record<string, string> = {}
  for (const key of ['name', 'company', 'email', 'telephone', 'service', 'projectLocation', 'description', 'anticipatedStart', 'consent']) {
    const v = formData.get(key)
    if (typeof v === 'string') values[key] = v
  }
  return values
}

export async function processEnquiry(formData: FormData, clientKey: string): Promise<EnquiryState> {
  const values = valuesFrom(formData)
  const fail = (message: string, fieldErrors: EnquiryFieldErrors = {}): EnquiryState => ({
    status: 'error',
    message,
    fieldErrors,
    values,
  })

  // Honeypot: hidden from people, often filled by bots. Reject quietly.
  if (formData.get('website')) return fail('Your enquiry could not be submitted. Please try again.')

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData))
  const fieldErrors: EnquiryFieldErrors = {}
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EnquiryFieldErrors
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
  }

  const attachment = await checkAttachment(formData.get('attachment'))
  if (attachment && 'error' in attachment) fieldErrors.attachment = attachment.error

  const payload = await getPayloadClient()

  // The service must be one currently offered on the website, or "Other".
  let serviceId: number | undefined
  let serviceLabel = 'Other / not sure'
  if (parsed.success && parsed.data.service !== OTHER_SERVICE) {
    const { docs } = await payload.find({
      collection: 'services',
      where: { slug: { equals: parsed.data.service } },
      limit: 1,
      overrideAccess: false,
      depth: 0,
    })
    if (docs[0]) {
      serviceId = docs[0].id
      serviceLabel = docs[0].title
    } else {
      fieldErrors.service = 'Select a service from the list.'
    }
  }

  const errorCount = Object.keys(fieldErrors).length
  if (!parsed.success || errorCount > 0) {
    return fail(
      errorCount === 1
        ? 'There is a problem with 1 field. Please correct it and submit again.'
        : `There are problems with ${errorCount} fields. Please correct them and submit again.`,
      fieldErrors,
    )
  }

  // Counted only for valid submissions, so correcting form errors never locks a visitor out.
  if (isRateLimited(clientKey)) {
    return fail('Too many enquiries have been sent from this connection. Please wait 10 minutes and try again.')
  }

  const data = parsed.data
  const file = attachment && !('error' in attachment) ? attachment : null

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference()
    const req = await createLocalReq({}, payload)
    await initTransaction(req)
    let storedFilename: string | undefined
    try {
      let attachmentId: number | undefined
      if (file) {
        const doc = await payload.create({
          collection: 'enquiry-attachments',
          data: {},
          file: { ...file, name: `${reference}-${file.name}` },
          overrideAccess: true,
          req,
        })
        attachmentId = doc.id
        storedFilename = doc.filename ?? undefined
      }

      const enquiry = await payload.create({
        collection: 'enquiries',
        data: {
          reference,
          name: data.name,
          company: data.company,
          email: data.email,
          telephone: data.telephone,
          service: serviceId,
          serviceLabel,
          projectLocation: data.projectLocation,
          description: data.description,
          anticipatedStart: data.anticipatedStart ? `${data.anticipatedStart}T00:00:00.000Z` : undefined,
          attachment: attachmentId,
          sourcePage: data.sourcePage,
          status: 'new',
          emailNotification: 'not-configured',
        },
        overrideAccess: true,
        req,
      })

      if (attachmentId) {
        await payload.update({
          collection: 'enquiry-attachments',
          id: attachmentId,
          data: { enquiry: enquiry.id },
          overrideAccess: true,
          req,
        })
      }

      await commitTransaction(req)

      // The enquiry is saved. Email is a separate, optional step and never affects success.
      const emailStatus = await notifyStaff(enquiry.id, reference, serviceLabel, data)
      return { status: 'success', reference, emailStatus }
    } catch (error) {
      await killTransaction(req)
      if (storedFilename && !isS3Configured) {
        await unlink(path.resolve('private-uploads/enquiries', storedFilename)).catch(() => {})
      }
      const duplicate = error instanceof Error && /reference|unique/i.test(error.message)
      if (duplicate && attempt < 2) continue
      // Payload's upload validation inspects file structure (for example, malformed PDFs).
      if (error instanceof ValidationError && error.data?.errors?.some((e) => e.path === 'file')) {
        return fail('There is a problem with 1 field. Please correct it and submit again.', {
          attachment: 'The document could not be read. It may be damaged. Please upload the original file.',
        })
      }
      payload.logger.error({ err: error }, 'Failed to save enquiry')
      return fail('We could not save your enquiry because of a system error. Nothing was submitted. Please try again.')
    }
  }
  return fail('We could not save your enquiry. Please try again.')
}

async function notifyStaff(
  enquiryId: number,
  reference: string,
  serviceLabel: string,
  data: EnquiryInput,
): Promise<'sent' | 'not-configured' | 'failed'> {
  if (!isEmailConfigured) return 'not-configured'
  const payload = await getPayloadClient()
  let status: 'sent' | 'failed' = 'sent'
  try {
    await payload.sendEmail({
      to: process.env.ENQUIRY_NOTIFICATION_EMAIL,
      subject: `New project enquiry ${reference}: ${serviceLabel}`,
      text: [
        `Reference: ${reference}`,
        `Service: ${serviceLabel}`,
        `Company: ${data.company}`,
        `Location: ${data.projectLocation}`,
        '',
        `Review in the staff area: ${siteUrl}/admin/collections/enquiries/${enquiryId}`,
        '',
        'Contact details and attachments are available in the staff area only.',
      ].join('\n'),
    })
  } catch (error) {
    status = 'failed'
    payload.logger.error({ err: error }, `Enquiry ${reference} saved but notification email failed`)
  }
  await payload.update({
    collection: 'enquiries',
    id: enquiryId,
    data: { emailNotification: status },
    overrideAccess: true,
  })
  return status
}
