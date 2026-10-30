import type { Metadata } from 'next'

import { ProjectCard, statusLabel } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { ProjectFilter } from '@/components/site/ProjectFilter'
import { Container, Notice, PageHeader } from '@/components/site/ui'
import { getProjects, getServices, populatedList } from '@/lib/content'
import { showUnverifiedContent } from '@/lib/env'
import type { Service } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Project case studies across NDEL service areas: challenge, scope, approach and outcome.',
  alternates: { canonical: '/projects' },
}

type Props = { searchParams: Promise<{ service?: string; status?: string }> }

export default async function ProjectsPage({ searchParams }: Props) {
  const [{ service, status }, projects, services] = await Promise.all([searchParams, getProjects(), getServices()])
  const hasDemo = projects.some((p) => p.contentSource !== 'verified')

  const items = projects.map((p) => ({
    id: p.id,
    serviceSlugs: populatedList<Service>(p.services).map((s) => s.slug),
    status: p.projectStatus,
    card: <ProjectCard project={p} headingLevel={2} />,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Project case studies"
        intro={<p>Filter by service and status. Each case study sets out the challenge, scope, approach and outcome.</p>}
      />
      <section aria-label="Project list" className="py-14 sm:py-16">
        <Container>
          {showUnverifiedContent && hasDemo && (
            <div className="mb-10">
              <Notice tone="demo">
                <strong>Demonstration case studies.</strong> Items labelled as samples are fictional examples written
                to show the case-study format. They do not describe real NDEL projects, clients or results.
              </Notice>
            </div>
          )}
          {projects.length === 0 ? (
            <p className="text-lg text-muted">Case studies will be published here once approved by NDEL.</p>
          ) : (
            <ProjectFilter
              items={items}
              services={services.map((s) => ({ value: s.slug, label: s.title }))}
              statuses={Object.entries(statusLabel).map(([value, label]) => ({ value, label }))}
              initialService={service}
              initialStatus={status}
            />
          )}
        </Container>
      </section>
      <EnquiryBand />
    </>
  )
}
