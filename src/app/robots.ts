import type { MetadataRoute } from 'next'

import { isDemoMode, siteUrl } from '@/lib/env'

// Read at request time so SITE_MODE can change per deployment without a rebuild.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  if (isDemoMode) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/demo-access'] },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
