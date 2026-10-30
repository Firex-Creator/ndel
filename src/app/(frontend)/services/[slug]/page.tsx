import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard, ProjectCard } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { ProcessDiagram } from '@/components/site/Illustrations'
import { motifFor, VisualOrPlaceholder } from '@/components/site/Imagery'
import { Arrow, ContentBadge, Container, Eyebrow, GridLines, SectionHeading, SignalLink } from '@/components/site/ui'
import { articlesForService, getArticles, getProjects, getService, projectsForService } from '@/lib/content'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug)
  if (!service) return {}
  return {
    title: service.title,
    description: service.metaDescription || service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  }
}

function List({ title, items, id }: { title: string; items?: { item: string; id?: string | null }[] | null; id: string }) {
  if (!items?.length) return null
  return (
    <section aria-labelledby={id} className="reveal">
      <h2 id={id} className="text-2xl font-bold text-navy-900">
        {title}
      </h2>
      <ul className="mt-5 grid gap-3">
        {items.map((i) => (
          <li key={i.id ?? i.item} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-teal-600" />
            <span>{i.item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) notFound()

  const [projects, articles] = await Promise.all([getProjects(), getArticles()])
  const related = projectsForService(projects, service.id).slice(0, 3)
  const insights = articlesForService(articles, service.id).slice(0, 3)
  const enquiryHref = `/contact?service=${encodeURIComponent(service.slug)}`

  return (
    <>
      <header className="relative overflow-hidden bg-navy-900 text-paper">
        <GridLines />
        <Container className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-paper/70">
              <ol className="flex flex-wrap gap-2">
                <li>
                  <Link href="/services" className="underline-offset-4 hover:text-paper hover:underline">
                    Services
                  </Link>
                  <span aria-hidden="true" className="ml-2">/</span>
                </li>
                <li aria-current="page" className="text-paper">
                  {service.title}
                </li>
              </ol>
            </nav>
            <h1 className="mt-6 text-4xl font-bold sm:text-5xl">{service.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-paper/80">{service.summary}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SignalLink href={enquiryHref}>Discuss Your Project</SignalLink>
            </div>
            <ContentBadge source={service.contentSource} className="mt-6" />
          </div>
          <VisualOrPlaceholder
            media={service.heroImage}
            label={service.title}
            motif={motifFor(service.slug)}
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="aspect-[4/3]"
            priority
          />
        </Container>
      </header>

      <div className="py-16 sm:py-20">
        <Container className="grid gap-14 lg:grid-cols-[1fr_20rem]">
          <div className="grid gap-14">
            {service.overview && (
              <section aria-labelledby="overview" className="reveal">
                <h2 id="overview" className="sr-only">
                  Overview
                </h2>
                <p className="max-w-3xl text-xl leading-relaxed text-navy-900">{service.overview}</p>
              </section>
            )}
            <div className="grid gap-14 md:grid-cols-2">
              <List id="problems" title="Problems this service addresses" items={service.problems} />
              <List id="applications" title="Typical applications" items={service.applications} />
            </div>
            <List id="scope" title="Scope of work" items={service.scope} />
          </div>
          <aside aria-label="Start an enquiry" className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-rule bg-white p-6">
              <Eyebrow>Enquire</Eyebrow>
              <p className="mt-3 font-display text-xl font-bold text-navy-900">Planning work in this area?</p>
              <p className="mt-2 text-[0.95rem] text-muted">
                The enquiry form opens with this service already selected.
              </p>
              <Link
                href={enquiryHref}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-navy-900 px-5 font-semibold text-paper hover:bg-navy-700"
              >
                Discuss Your Project <Arrow />
              </Link>
            </div>
          </aside>
        </Container>
      </div>

      {service.process && service.process.length > 0 && (
        <section aria-labelledby="delivery-heading" className="border-y border-rule bg-paper-2 py-16 sm:py-20">
          <Container>
            <SectionHeading id="delivery-heading" eyebrow="Delivery process" title="How the work is delivered" />
            <div className="mt-14">
              <ProcessDiagram steps={service.process} />
            </div>
          </Container>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="py-16 sm:py-20">
          <Container>
            <SectionHeading id="related-heading" eyebrow="Relevant projects" title="Related case studies" />
            <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id} className="reveal">
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {insights.length > 0 && (
        <section aria-labelledby="insights-heading" className="border-t border-rule py-16 sm:py-20">
          <Container>
            <SectionHeading id="insights-heading" eyebrow="Insights" title="Related technical updates" />
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {insights.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <EnquiryBand title={`Enquire about ${service.title}`} href={enquiryHref} />
    </>
  )
}
