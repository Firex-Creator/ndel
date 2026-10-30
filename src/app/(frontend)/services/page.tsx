import type { Metadata } from 'next'

import { ServiceCard } from '@/components/site/Cards'
import { EnquiryBand } from '@/components/site/EnquiryBand'
import { ProcessDiagram } from '@/components/site/Illustrations'
import { Container, PageHeader, SectionHeading } from '@/components/site/ui'
import { getServices } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Offshore mooring, commercial diving and ROV, asset integrity management, offshore wind support, marine maintenance and salvage, and turnkey EPCIC services.',
  alternates: { canonical: '/services' },
}

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Subsea, marine and offshore engineering services"
        intro={<p>Choose a service to see its scope, typical applications, how it is delivered and related projects.</p>}
      />
      <section aria-label="Service list" className="py-16 sm:py-20">
        <Container>
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </Container>
      </section>
      <section aria-labelledby="process-heading" className="border-t border-rule bg-paper-2 py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="process-heading"
            eyebrow="Delivery"
            title="A consistent delivery sequence"
            intro={<p>Each service page details its own steps. Most engagements follow this outline.</p>}
          />
          <div className="mt-14">
            <ProcessDiagram />
          </div>
        </Container>
      </section>
      <EnquiryBand />
    </>
  )
}
