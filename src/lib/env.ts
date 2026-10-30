// Server-only environment helpers. Nothing here is exposed to the browser.

export const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/** "demo" (default) = password-protected proposal; "live" = public production site. */
export const isDemoMode = process.env.SITE_MODE !== 'live'

/**
 * Unverified material (demonstration samples and statements carried over from the
 * existing website) is only visible publicly in demo mode. In live mode the public
 * site shows content marked "verified" only.
 */
export const showUnverifiedContent = isDemoMode

export const isEmailConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_FROM_ADDRESS && process.env.ENQUIRY_NOTIFICATION_EMAIL,
)

export const isS3Configured = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
)
