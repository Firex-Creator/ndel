import type { Metadata } from 'next'

import { ContactDetails } from '@/components/site/ContactDetails'
import { EnquiryForm } from '@/components/site/EnquiryForm'
import { Container, PageHeader } from '@/components/site/ui'
import { getContactInfo, getProject, getServices } from '@/lib/content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Discuss Your Project',
  description: 'Contact NDEL and submit a technical project enquiry.',
  alternates: { canonical: '/contact' },
}

type Props = { searchParams: Promise<{ service?: string; project?: string }> }

export default async function ContactPage({ searchParams }: Props) {
  const { service, project: projectSlug } = await searchParams
  const [services, contact, project] = await Promise.all([
    getServices(),
    getContactInfo(),
    projectSlug ? getProject(projectSlug) : null,
  ])
  const defaultService = services.some((s) => s.slug === service) ? service : undefined
  const map = contact.map
  const showMap = Boolean(map?.locationVerified && map.latitude != null && map.longitude != null)

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Discuss your project"
        intro={
          <p>
            Send a technical enquiry and our team will review it. You will receive an enquiry reference as soon as it is
            saved.
          </p>
        }
      />
      <Container className="grid gap-14 py-14 sm:py-16 lg:grid-cols-[1fr_20rem]">
        <section aria-label="Project enquiry form">
          <EnquiryForm
            services={services.map((s) => ({ value: s.slug, label: s.title }))}
            defaultService={defaultService}
            sourcePage={project ? `/projects/${project.slug}` : defaultService ? `/services/${defaultService}` : '/contact'}
            projectTitle={project?.title}
          />
        </section>
        <aside aria-labelledby="contact-details-heading" className="lg:border-l lg:border-rule lg:pl-10">
          <h2 id="contact-details-heading" className="text-2xl font-bold text-navy-900">
            Contact details
          </h2>
          <div className="mt-6 text-[0.95rem]">
            <ContactDetails info={contact} />
          </div>
          {showMap && (
            <div className="mt-8">
              <iframe
                title="Map showing the NDEL office location"
                className="aspect-square w-full border border-rule"
                loading="lazy"
                referrerPolicy="no-referrer"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${map!.longitude! - 0.01},${map!.latitude! - 0.01},${map!.longitude! + 0.01},${map!.latitude! + 0.01}&layer=mapnik&marker=${map!.latitude},${map!.longitude}`}
              />
            </div>
          )}
        </aside>
      </Container>
    </>
  )
}
