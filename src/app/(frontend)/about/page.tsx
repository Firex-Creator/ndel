import type { Metadata } from 'next'

import { EnquiryBand } from '@/components/site/EnquiryBand'
import { CmsImage } from '@/components/site/Imagery'
import { DocumentList } from '@/components/site/DocumentList'
import { ContentBadge, Container, Notice, PageHeader, SectionHeading } from '@/components/site/ui'
import { getCompany, getTeam, populated, visibleDocument } from '@/lib/content'
import { showUnverifiedContent } from '@/lib/env'
import type { Document, Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About',
  description: 'About NDEL: company overview, leadership, operating approach and credentials.',
  alternates: { canonical: '/about' },
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default async function AboutPage() {
  const [company, team] = await Promise.all([getCompany(), getTeam()])
  const credentials = (company.credentials ?? [])
    .map((c) => visibleDocument(c as number | Document))
    .filter((d): d is Document => Boolean(d))
  const showOverview = company.overviewStatus === 'verified' || showUnverifiedContent
  const name = company.registeredNameConfirmed && company.registeredName ? company.registeredName : company.displayName

  return (
    <>
      <PageHeader eyebrow="About" title={`About ${company.displayName}`} />

      <section aria-labelledby="overview-heading" className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading id="overview-heading" eyebrow="Company overview" title={name} />
            {company.overviewStatus !== 'verified' && <ContentBadge source="pending" className="mt-6" />}
          </div>
          <div className="grid gap-5 text-lg">
            {showOverview && company.overview?.length ? (
              company.overview.map((p) => <p key={p.id ?? p.paragraph}>{p.paragraph}</p>)
            ) : (
              <p className="text-muted">The company overview will be published once approved by NDEL.</p>
            )}
          </div>
        </Container>
      </section>

      {company.operatingApproach && company.operatingApproach.length > 0 && (
        <section aria-labelledby="approach-heading" className="border-y border-rule bg-paper-2 py-16 sm:py-20">
          <Container>
            <SectionHeading id="approach-heading" eyebrow="Operating approach" title="How we work" />
            <ul className="mt-12 grid gap-px border border-rule bg-rule md:grid-cols-2 lg:grid-cols-4">
              {company.operatingApproach.map((a, i) => (
                <li key={a.id ?? a.title} className="reveal bg-paper p-6">
                  <span className="font-mono text-sm text-teal-700" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-navy-900">{a.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-muted">{a.description}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section aria-labelledby="leadership-heading" className="py-16 sm:py-20">
        <Container>
          <SectionHeading id="leadership-heading" eyebrow="Leadership" title="Leadership team" />
          {team.length === 0 ? (
            <p className="mt-8 text-muted">Leadership profiles will be published once approved by NDEL.</p>
          ) : (
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((m) => {
                const photo = populated<Media>(m.photo)
                return (
                  <li key={m.id} className="reveal border border-rule bg-white">
                    <div className="aspect-[4/3] bg-navy-800">
                      {photo?.url ? (
                        <CmsImage media={photo} sizes="(min-width: 1024px) 33vw, 100vw" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-paper/80">
                          <span className="font-display text-4xl font-bold" aria-hidden="true">
                            {initials(m.name)}
                          </span>
                          <span className="font-mono text-[0.68rem]">Portrait to be supplied</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <ContentBadge source={m.contentSource} />
                      <h3 className="mt-3 text-xl font-bold text-navy-900">{m.name}</h3>
                      <p className="mt-1 font-medium text-teal-700">{m.position}</p>
                      {m.bio && <p className="mt-3 text-[0.95rem] text-muted">{m.bio}</p>}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>

      <section aria-labelledby="credentials-heading" className="border-t border-rule bg-white py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading
            id="credentials-heading"
            eyebrow="Credentials"
            title="Verified credentials and documents"
            intro={<p>Certificates and accreditations are listed only when the supporting document has been supplied.</p>}
          />
          <div>
            {credentials.length > 0 ? (
              <DocumentList documents={credentials} />
            ) : (
              <Notice>
                No credentials have been published yet. Certificates will appear here with the issuing body, certificate
                number and validity date once NDEL supplies copies for verification.
              </Notice>
            )}
          </div>
        </Container>
      </section>

      <EnquiryBand />
    </>
  )
}
