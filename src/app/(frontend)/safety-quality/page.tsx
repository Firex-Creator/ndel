import type { Metadata } from 'next'

import { DocumentList } from '@/components/site/DocumentList'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { Container, Notice, PageHeader } from '@/components/site/ui'
import { getSafetyQuality, visibleDocument } from '@/lib/content'
import { showUnverifiedContent } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Safety and Quality',
  description: 'NDEL health, safety, environment and quality policy information and documents.',
  alternates: { canonical: '/safety-quality' },
}

export default async function SafetyQualityPage() {
  const safety = await getSafetyQuality()
  const sections = (safety.sections ?? []).filter((s) => s.status === 'verified' || showUnverifiedContent)
  const documents = (safety.sections ?? []).map((s) => visibleDocument(s.document)).filter((d) => d !== null)

  return (
    <>
      <PageHeader
        eyebrow="Safety and quality"
        title="Health, safety, environment and quality"
        intro={safety.introduction ? <p>{safety.introduction}</p> : undefined}
      />
      <Container className="py-14 sm:py-16">
        {sections.some((s) => s.status !== 'verified') && (
          <div className="mb-12">
            <Notice tone="demo">
              <strong>Structure only.</strong> Policy areas marked &ldquo;awaiting document&rdquo; show how this page
              will be organised. They make no claim about NDEL&rsquo;s systems and will be completed from NDEL&rsquo;s
              own policy documents.
            </Notice>
          </div>
        )}

        {sections.length === 0 ? (
          <p className="text-lg text-muted">Safety and quality information will be published once approved by NDEL.</p>
        ) : (
          <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
            {sections.map((s, i) => {
              const doc = visibleDocument(s.document)
              return (
                <section key={s.id ?? s.heading} aria-labelledby={`sq-${i}`} className="reveal bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 id={`sq-${i}`} className="text-2xl font-bold text-navy-900">
                      {s.heading}
                    </h2>
                    <span
                      className={`eyebrow border px-2 py-1 text-[0.68rem] ${
                        s.status === 'verified' ? 'border-teal-600 text-teal-700' : 'border-navy-500 text-navy-700'
                      }`}
                    >
                      {s.status === 'verified' ? 'Document available' : 'Awaiting document'}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-muted">{s.body}</p>
                  {doc && (
                    <a href={doc.url!} download className="mt-5 inline-flex items-center gap-2 font-semibold text-teal-700 underline underline-offset-4">
                      Download {doc.title} (PDF)
                    </a>
                  )}
                </section>
              )
            })}
          </div>
        )}

        <section aria-labelledby="sq-docs" className="mt-16">
          <h2 id="sq-docs" className="text-2xl font-bold text-navy-900">
            Policy documents
          </h2>
          <div className="mt-6">
            {documents.length > 0 ? (
              <DocumentList documents={documents} />
            ) : (
              <p className="text-muted">No policy documents have been published yet.</p>
            )}
          </div>
        </section>
      </Container>
      <EnquiryBand />
    </>
  )
}
