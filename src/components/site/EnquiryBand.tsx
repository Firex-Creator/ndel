import { getContactInfo } from '@/lib/content'

import { ContactDetails } from './ContactDetails'
import { Container, GridLines, SectionHeading, SignalLink } from './ui'

export async function EnquiryBand({
  title = 'Discuss your project with our engineers',
  href = '/contact',
}: {
  title?: string
  href?: string
}) {
  const contact = await getContactInfo()
  return (
    <section aria-labelledby="enquiry-band-heading" className="relative overflow-hidden bg-navy-900 text-paper">
      <GridLines />
      <Container className="relative grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading
            id="enquiry-band-heading"
            tone="light"
            eyebrow="Start a technical enquiry"
            title={title}
            intro={
              <p>
                Tell us the service you need, the location and what you are trying to achieve. You can attach a
                drawing, specification or scope document. Every enquiry receives a reference number.
              </p>
            }
          />
          <div className="mt-8">
            <SignalLink href={href}>Discuss Your Project</SignalLink>
          </div>
        </div>
        <div className="border-t border-paper/20 pt-8 text-[0.95rem] lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <ContactDetails info={contact} tone="light" />
        </div>
      </Container>
    </section>
  )
}
