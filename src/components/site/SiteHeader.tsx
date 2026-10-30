import Link from 'next/link'

import { MobileNav } from './MobileNav'
import { Logo } from './Logo'
import { nav } from './ui'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-800 bg-navy-900/95 text-paper backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      <div className="mx-auto flex h-18 max-w-(--container-site) items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-[0.95rem] font-medium text-paper/85 transition-colors hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden min-h-11 items-center gap-2 border-2 border-paper bg-paper px-4 text-sm font-semibold text-navy-950 transition-colors hover:bg-white sm:inline-flex"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 bg-signal" />
            Discuss Your Project
          </Link>
          <MobileNav items={[...nav, { href: '/contact', label: 'Contact' }]} />
        </div>
      </div>
    </header>
  )
}
