import type { MetadataRoute } from 'next'

import { getArticles, getProjects, getServices } from '@/lib/content'
import { siteUrl } from '@/lib/env'

export const dynamic = 'force-dynamic'

/** Lists only content visible to the public, so it follows the same rules as the pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, articles] = await Promise.all([getServices(), getProjects(), getArticles()])
  const page = (path: string, lastModified?: string) => ({ url: `${siteUrl}${path}`, lastModified })

  return [
    ...['', '/services', '/projects', '/safety-quality', '/about', '/insights', '/contact'].map((p) => page(p)),
    ...services.map((s) => page(`/services/${s.slug}`, s.updatedAt)),
    ...projects.map((p) => page(`/projects/${p.slug}`, p.updatedAt)),
    ...articles.map((a) => page(`/insights/${a.slug}`, a.updatedAt)),
  ]
}
