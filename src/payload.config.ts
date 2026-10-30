import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Documents } from './collections/Documents'
import { Enquiries } from './collections/Enquiries'
import { EnquiryAttachments } from './collections/EnquiryAttachments'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Services } from './collections/Services'
import { TeamMembers } from './collections/TeamMembers'
import { Users } from './collections/Users'
import { Company } from './globals/Company'
import { ContactInfo } from './globals/ContactInfo'
import { SafetyQuality } from './globals/SafetyQuality'
import { isEmailConfigured, isS3Configured, siteUrl } from './lib/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: siteUrl,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' | NDEL staff',
      robots: 'noindex, nofollow',
    },
    components: {
      beforeDashboard: ['@/components/admin/EnquirySummary#EnquirySummary'],
    },
  },
  collections: [Enquiries, EnquiryAttachments, Services, Projects, Articles, TeamMembers, Documents, Media, Users],
  globals: [Company, ContactInfo, SafetyQuality],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
  }),
  // The public site reads content through the Local API; GraphQL is not needed.
  graphQL: { disable: true },
  sharp,
  ...(isEmailConfigured
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM_ADDRESS!,
          defaultFromName: process.env.SMTP_FROM_NAME || 'NDEL Website',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
        }),
      }
    : {}),
  plugins: isS3Configured
    ? [
        s3Storage({
          // Files stay behind Payload's access control (no direct public bucket URLs).
          collections: { media: true, documents: true, 'enquiry-attachments': true },
          bucket: process.env.S3_BUCKET!,
          config: {
            region: process.env.S3_REGION || 'auto',
            endpoint: process.env.S3_ENDPOINT || undefined,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID!,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            },
          },
        }),
      ]
    : [],
})
