import Link from 'next/link'

import { populatedList } from '@/lib/content'
import type { Article, Project, Service } from '@/payload-types'

import { motifFor, VisualOrPlaceholder } from './Imagery'
import { Arrow, ContentBadge } from './ui'

export const statusLabel: Record<Project['projectStatus'], string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
}

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const problem = service.problems?.[0]?.item
  return (
    <article className="reveal group relative flex flex-col border border-rule bg-white p-6 transition-colors hover:border-navy-900 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm text-teal-700" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <ContentBadge source={service.contentSource} />
      </div>
      <h3 className="mt-6 text-2xl font-bold text-navy-900">
        <Link href={`/services/${service.slug}`} className="after:absolute after:inset-0">
          {service.title}
        </Link>
      </h3>
      <p className="mt-3 text-muted">{service.summary}</p>
      {problem && (
        <p className="mt-5 border-l-2 border-signal pl-3 text-[0.95rem] text-navy-800">
          <span className="sr-only">Addresses: </span>
          {problem}
        </p>
      )}
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-teal-700 group-hover:text-navy-900">
        View service <Arrow />
      </span>
    </article>
  )
}

export function ProjectCard({ project, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) {
  const services = populatedList<Service>(project.services)
  const Heading = `h${headingLevel}` as const
  return (
    <article className="group relative flex h-full flex-col border border-rule bg-white transition-colors hover:border-navy-900">
      <VisualOrPlaceholder
        media={project.heroImage}
        label={project.title}
        motif={motifFor(services[0]?.slug)}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10]"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ContentBadge source={project.contentSource} />
          <span className="eyebrow text-[0.7rem] text-muted">{statusLabel[project.projectStatus]}</span>
        </div>
        <Heading className="mt-4 text-xl font-bold text-navy-900">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-3 text-[0.95rem] text-muted">{project.summary}</p>
        <p className="mt-auto pt-5 font-mono text-xs text-teal-700">
          {services.map((s) => s.title).join(' · ')}
          {project.location ? ` | ${project.location}` : ''}
        </p>
      </div>
    </article>
  )
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="reveal group relative flex flex-col border-t-2 border-navy-900 pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <time dateTime={article.publishedDate} className="font-mono text-xs text-muted">
          {formatDate(article.publishedDate)}
        </time>
        <ContentBadge source={article.contentSource} />
      </div>
      <h3 className="mt-3 text-xl font-bold text-navy-900">
        <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0 group-hover:underline">
          {article.title}
        </Link>
      </h3>
      <p className="mt-2 text-[0.95rem] text-muted">{article.excerpt}</p>
      <p className="mt-3 text-sm text-navy-800">By {article.authorName}</p>
    </article>
  )
}
