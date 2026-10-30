import Link from 'next/link'
import type React from 'react'

export const nav = [
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/safety-quality', label: 'Safety & Quality' },
  { href: '/about', label: 'About' },
  { href: '/insights', label: 'Insights' },
] as const

export function Container({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`mx-auto w-full max-w-(--container-site) px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

type ButtonProps = {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost-light'
  className?: string
}

const buttonStyles = {
  primary: 'bg-navy-900 text-paper hover:bg-navy-700 border-navy-900',
  secondary: 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-paper',
  'ghost-light': 'border-paper/40 text-paper hover:border-paper hover:bg-paper/10',
}

export function ButtonLink({ href, children, variant = 'primary', className = '' }: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 border-2 px-6 py-3 text-base font-semibold transition-colors duration-150 ${buttonStyles[variant]} ${className}`}
    >
      {children}
    </Link>
  )
}

/** The orange-accented primary action used on dark surfaces. */
export function SignalLink({ href, children, className = '' }: Omit<ButtonProps, 'variant'>) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-3 border-2 border-paper bg-paper px-6 py-3 text-base font-semibold text-navy-950 transition-colors duration-150 hover:bg-white ${className}`}
    >
      <span aria-hidden="true" className="h-3 w-3 bg-signal" />
      {children}
    </Link>
  )
}

export function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  )
}

export function Eyebrow({ children, tone = 'dark' }: { children: React.ReactNode; tone?: 'dark' | 'light' }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${tone === 'light' ? 'text-teal-300' : 'text-teal-700'}`}>
      <span aria-hidden="true" className="h-px w-8 bg-signal" />
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  tone = 'dark',
  id,
}: {
  eyebrow?: string
  title: string
  intro?: React.ReactNode
  tone?: 'dark' | 'light'
  id?: string
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <h2 id={id} className={`mt-4 text-3xl font-bold sm:text-4xl ${tone === 'light' ? 'text-paper' : 'text-navy-900'}`}>
        {title}
      </h2>
      {intro && <div className={`mt-4 text-lg ${tone === 'light' ? 'text-paper/80' : 'text-muted'}`}>{intro}</div>}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="relative overflow-hidden bg-navy-900 text-paper">
      <GridLines />
      <Container className="relative py-14 sm:py-20">
        <Eyebrow tone="light">{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <div className="mt-6 max-w-2xl text-lg text-paper/80">{intro}</div>}
        {children}
      </Container>
    </header>
  )
}

/** Faint engineering-drawing grid used on dark headers. Decorative. */
export function GridLines() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]">
      <defs>
        <pattern id="ndel-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="#f6f4ef" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ndel-grid)" />
    </svg>
  )
}

type Source = 'verified' | 'pending' | 'demonstration' | null | undefined

/** Labels any content that is not approved company content. Renders nothing for verified items. */
export function ContentBadge({ source, className = '' }: { source: Source; className?: string }) {
  if (source === 'demonstration') {
    return (
      <span
        className={`eyebrow inline-flex items-center gap-2 border border-signal-dark bg-[#fff1e8] px-2 py-1 text-[0.7rem] text-signal-dark ${className}`}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" />
        Demonstration sample
      </span>
    )
  }
  if (source === 'pending') {
    return (
      <span
        className={`eyebrow inline-flex items-center gap-2 border border-navy-500 bg-paper-2 px-2 py-1 text-[0.7rem] text-navy-700 ${className}`}
      >
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-navy-700" />
        Pending NDEL verification
      </span>
    )
  }
  return null
}

export function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'demo' }) {
  return (
    <div
      className={`border-l-4 px-5 py-4 text-base ${
        tone === 'demo' ? 'border-signal bg-[#fff6ef] text-navy-900' : 'border-teal-600 bg-teal-100/60 text-navy-900'
      }`}
    >
      {children}
    </div>
  )
}
