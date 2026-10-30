import Link from 'next/link'

export function Logo({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const text = tone === 'light' ? 'text-paper' : 'text-navy-900'
  return (
    <Link href="/" className={`group inline-flex items-center gap-3 ${text}`} aria-label="NDEL home">
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M9 30V10h4l10 13V10h4v20h-4L13 17v13z" fill="currentColor" />
        <rect x="29" y="25" width="5" height="5" fill="#e5600f" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-[0.08em]">NDEL</span>
        <span className="eyebrow mt-1 text-[0.6rem] opacity-75">Subsea &amp; marine engineering</span>
      </span>
    </Link>
  )
}
