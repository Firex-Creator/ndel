import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { statusLabel } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { CmsImage, motifFor, VisualOrPlaceholder } from '@/components/site/Imagery'
import { ContentBadge, Container, GridLines, Notice } from '@/components/site/ui'
import { VideoEmbed } from '@/components/site/VideoEmbed'
import { getProject, populated, populatedList } from '@/lib/content'
import type { Media, Service } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug)
  if (!project) return {}
  return { title: project.title, description: project.summary, alternates: { canonical: `/projects/${project.slug}` } }
}

const sections = [
  { key: 'challenge', title: 'Challenge' },
  { key: 'scope', title: 'Scope' },
  { key: 'approach', title: 'Approach' },
  { key: 'outcome', title: 'Outcome' },
] as const

export default async function ProjectPage({ params }: Props) {
  const project = await getProject((await params).slug)
  if (!project) notFound()

  const services = populatedList<Service>(project.services)
  const gallery = (project.gallery ?? []).map((g) => populated<Media>(g.image)).filter((m): m is Media => Boolean(m))
  const enquiryHref = `/contact?service=${encodeURIComponent(services[0]?.slug ?? '')}&project=${encodeURIComponent(project.slug)}`

  const facts = [
    { label: 'Services', value: services.map((s) => s.title).join(', ') },
    { label: 'Status', value: statusLabel[project.projectStatus] },
    { label: 'Location', value: project.location },
    { label: 'Period', value: project.period },
    { label: 'Client', value: project.clientName },
  ].filter((f) => f.value)

  return (
    <article>
      <header className="relative overflow-hidden bg-navy-900 text-paper">
        <GridLines />
        <Container className="relative py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-paper/70">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/projects" className="underline-offset-4 hover:text-paper hover:underline">
                  Projects
                </Link>
                <span aria-hidden="true" className="ml-2">/</span>
              </li>
              <li aria-current="page" className="text-paper">
                {project.title}
              </li>
            </ol>
          </nav>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold sm:text-5xl">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-paper/80">{project.summary}</p>
          <dl className="mt-10 grid gap-6 border-t border-paper/20 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="eyebrow text-teal-300">{f.label}</dt>
                <dd className="mt-1 text-paper">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </header>

      <Container className="py-14 sm:py-16">
        {project.contentSource === 'demonstration' && (
          <div className="mb-10">
            <Notice tone="demo">
              <ContentBadge source="demonstration" className="mb-2" />
              <p>
                This is a fictional case study written to demonstrate the format. It does not describe a real NDEL
                project, client or result.
              </p>
            </Notice>
          </div>
        )}
        {project.contentSource === 'pending' && (
          <div className="mb-10">
            <Notice>This case study is awaiting verification by NDEL.</Notice>
          </div>
        )}

        <VisualOrPlaceholder
          media={project.heroImage}
          label={project.title}
          motif={motifFor(services[0]?.slug)}
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="aspect-[21/9]"
          priority
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          {sections.map((s, i) => (
            <section key={s.key} aria-labelledby={`cs-${s.key}`} className="reveal border-t-2 border-navy-900 pt-5">
              <p className="font-mono text-sm text-teal-700" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h2 id={`cs-${s.key}`} className="mt-2 text-2xl font-bold text-navy-900">
                {s.title}
              </h2>
              <p className="mt-4 whitespace-pre-line">{project[s.key]}</p>
            </section>
          ))}
        </div>

        {project.videoUrl && (
          <section aria-labelledby="video-heading" className="mt-16">
            <h2 id="video-heading" className="text-2xl font-bold text-navy-900">
              Project video
            </h2>
            <div className="mt-6">
              <VideoEmbed url={project.videoUrl} title={project.title} />
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section aria-labelledby="gallery-heading" className="mt-16">
            <h2 id="gallery-heading" className="text-2xl font-bold text-navy-900">
              Gallery
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((m) => (
                <li key={m.id} className="aspect-[4/3] overflow-hidden bg-navy-800">
                  <CmsImage media={m} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>

      <EnquiryBand title="Planning similar work?" href={enquiryHref} />
    </article>
  )
}
