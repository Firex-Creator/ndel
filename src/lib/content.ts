import 'server-only'

import { cache } from 'react'

import { getPayloadClient } from '@/lib/payload'
import type { Article, Document, Media, Project, Service } from '@/payload-types'

// Every query runs as an anonymous visitor (overrideAccess: false), so the
// collection access rules decide what is public, exactly as for the REST API.
const asVisitor = { overrideAccess: false } as const

export const getServices = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'services', sort: 'order', limit: 50, depth: 1, ...asVisitor })
  return docs
})

export const getService = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    ...asVisitor,
  })
  return docs[0] ?? null
})

export const getProjects = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'projects', sort: '-updatedAt', limit: 100, depth: 1, ...asVisitor })
  return docs
})

export const getProject = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    ...asVisitor,
  })
  return docs[0] ?? null
})

export const getArticles = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'articles', sort: '-publishedDate', limit: 50, depth: 1, ...asVisitor })
  return docs
})

export const getArticle = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    ...asVisitor,
  })
  return docs[0] ?? null
})

export const getTeam = cache(async () => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'team-members', sort: 'order', limit: 50, depth: 1, ...asVisitor })
  return docs
})

export const getCompany = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'company', depth: 1, ...asVisitor })
})

export const getContactInfo = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'contact-info', ...asVisitor })
})

export const getSafetyQuality = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'safety-quality', depth: 1, ...asVisitor })
})

/* ------------------------------- helpers ------------------------------- */

/** Narrow a relationship value to a populated document (relationships may be bare IDs). */
export function populated<T extends { id: number }>(value: number | T | null | undefined): T | null {
  return value && typeof value === 'object' ? value : null
}

export function populatedList<T extends { id: number }>(values: (number | T)[] | null | undefined): T[] {
  return (values ?? []).filter((v): v is T => typeof v === 'object' && v !== null)
}

/**
 * A relationship to a document the visitor may not read comes back as a bare ID,
 * so a populated, published document here is safe to show publicly.
 */
export const visibleDocument = (value: number | Document | null | undefined) => {
  const doc = populated(value)
  return doc?.published && doc.url ? doc : null
}

export const projectsForService = (projects: Project[], serviceId: number) =>
  projects.filter((p) => populatedList<Service>(p.services).some((s) => s.id === serviceId))

export const articlesForService = (articles: Article[], serviceId: number) =>
  articles.filter((a) => populatedList<Service>(a.relatedServices).some((s) => s.id === serviceId))

export type { Article, Document, Media, Project, Service }
