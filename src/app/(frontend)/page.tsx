import Link from 'next/link'

import { ProjectCard, ServiceCard } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { MooringSchematic, ProcessDiagram } from '@/components/site/Illustrations'
import { Arrow, ButtonLink, Container, GridLines, SectionHeading, SignalLink } from '@/components/site/ui'
import { getCompany, getProjects, getSafetyQuality, getServices, visibleDocument } from '@/lib/content'
import { showUnverifiedContent } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [services, projects, safety, company] = await Promise.all([
    getServices(),
    getProjects(),
    getSafetyQuality(),
    getCompany(),
  ])

  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 3)
  const profile = visibleDocument(company.companyProfile)
  const safetyAreas = (safety.sections ?? []).filter((s) => s.status === 'verified' || showUnverifiedContent)
  const verifiedSafety = safetyAreas.filter((s) => s.status === 'verified')

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-navy-900 text-paper">
        <GridLines />
        <Container className="relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow flex items-center gap-3 text-teal-300">
              <span aria-hidden="true" className="h-px w-8 bg-signal" />
              Subsea · Marine · Offshore engineering
            </p>
            <h1 id="hero-heading" className="mt-6 text-4xl font-extrabold sm:text-5xl lg:text-[3.6rem]">
              Engineering and subsea services for offshore and coastal assets in Nigeria
            </h1>
            <p className="mt-6 max-w-xl text-lg text-paper/80">
              NDEL supports operators and contractors with offshore mooring, commercial diving and ROV work, asset
              integrity, offshore wind support, marine maintenance and salvage, and turnkey EPCIC delivery.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <SignalLink href="/contact">Discuss Your Project</SignalLink>
              <ButtonLink href="/services" variant="ghost-light">
                Explore Our Services
              </ButtonLink>
            </div>
          </div>
          <div className="relative">
            <MooringSchematic className="h-auto w-full text-paper" />
            <p className="mt-2 font-mono text-[0.68rem] text-paper/55">Illustrative schematic, not to scale.</p>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section aria-labelledby="services-heading" className="py-20 sm:py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="services-heading"
              eyebrow="What we do"
              title="Six service areas, one point of contact"
              intro={<p>Each service addresses a specific operational problem, from station-keeping to end-of-life recovery.</p>}
            />
            <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:text-navy-900">
              All services <Arrow />
            </Link>
          </div>
          <div className="mt-12 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section aria-labelledby="process-heading" className="border-y border-rule bg-paper-2 py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="process-heading"
            eyebrow="How work is delivered"
            title="From enquiry to close-out report"
            intro={<p>A typical sequence for a technical engagement. The exact steps depend on the service and the site.</p>}
          />
          <div className="mt-14">
            <ProcessDiagram />
          </div>
        </Container>
      </section>

      {/* Projects */}
      {featured.length > 0 && (
        <section aria-labelledby="projects-heading" className="py-20 sm:py-24">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading
                id="projects-heading"
                eyebrow="Case studies"
                title="Selected project case studies"
                intro={
                  showUnverifiedContent ? (
                    <p>
                      The case studies below are demonstration samples showing the intended format. They will be
                      replaced with project information supplied and approved by NDEL.
                    </p>
                  ) : undefined
                }
              />
              <Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-teal-700 hover:text-navy-900">
                All projects <Arrow />
              </Link>
            </div>
            <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <li key={p.id} className="reveal">
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Safety & quality evidence */}
      <section aria-labelledby="safety-heading" className="border-t border-rule bg-white py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              id="safety-heading"
              eyebrow="Safety and quality"
              title="Evidence before claims"
              intro={
                <p>
                  {verifiedSafety.length > 0
                    ? 'Our safety and quality commitments are set out in published policy documents.'
                    : 'Policies, certificates and accreditations will be published here as NDEL supplies the supporting documents. We do not state compliance we cannot evidence.'}
                </p>
              }
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/safety-quality" variant="secondary">
                Safety and quality
              </ButtonLink>
              {profile && (
                <a
                  href={profile.url!}
                  className="inline-flex min-h-12 items-center gap-2 border-2 border-transparent px-4 font-semibold text-teal-700 underline underline-offset-4 hover:text-navy-900"
                  download
                >
                  Download company profile (PDF{profile.filesize ? `, ${Math.ceil(profile.filesize / 1024)} KB` : ''})
                </a>
              )}
            </div>
          </div>
          {safetyAreas.length > 0 && (
            <ul className="grid gap-px self-start border border-rule bg-rule sm:grid-cols-2">
              {safetyAreas.slice(0, 4).map((s) => (
                <li key={s.id ?? s.heading} className="bg-white p-6">
                  <h3 className="text-lg font-bold text-navy-900">{s.heading}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {s.status === 'verified' ? 'Policy document available.' : 'Awaiting NDEL policy document.'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>

      <EnquiryBand />
    </>
  )
}
