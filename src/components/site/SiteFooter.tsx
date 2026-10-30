import Link from 'next/link'

import { getContactInfo, getServices } from '@/lib/content'

import { ContactDetails } from './ContactDetails'
import { Logo } from './Logo'
import { Container, nav } from './ui'

export async function SiteFooter() {
  const [services, contact] = await Promise.all([getServices(), getContactInfo()])

  return (
    <footer className="bg-navy-950 text-paper/85">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-6 max-w-xs text-sm text-paper/70">
            Subsea, marine and offshore engineering services, based in Nigeria.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-paper underline decoration-signal decoration-2 underline-offset-4"
          >
            Discuss your project
          </Link>
        </div>
        <nav aria-label="Services">
          <h2 className="eyebrow text-teal-300">Services</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link href={`/services/${s.slug}`} className="hover:text-paper hover:underline">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="eyebrow text-teal-300">Company</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-paper hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="hover:text-paper hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <h2 className="eyebrow text-teal-300">Contact</h2>
          <div className="mt-4">
            <ContactDetails info={contact} tone="light" />
          </div>
        </div>
      </Container>
      <div className="border-t border-navy-800">
        <Container className="flex flex-col gap-2 py-6 text-xs text-paper/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} NDEL. All rights reserved.</p>
          <p>Website demonstration by Metachain Software.</p>
        </Container>
      </div>
    </footer>
  )
}
