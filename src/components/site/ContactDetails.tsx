import type { ContactInfo } from '@/payload-types'
import { showUnverifiedContent } from '@/lib/env'

const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`

function Unverified({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <span className={`ml-2 text-xs font-normal ${tone === 'light' ? 'text-paper/60' : 'text-muted'}`}>
      (from previous website, to be confirmed)
    </span>
  )
}

/**
 * Contact details from the CMS. Unconfirmed details are shown with a note on the
 * demonstration site and omitted entirely once the site is live.
 */
export function ContactDetails({ info, tone = 'dark' }: { info: ContactInfo; tone?: 'light' | 'dark' }) {
  const visible = <T extends { verified?: boolean | null }>(item: T) => item.verified || showUnverifiedContent
  const phones = (info.phones ?? []).filter(visible)
  const emails = (info.emails ?? []).filter(visible)
  const address = info.address?.lines && visible(info.address) ? info.address : null
  const label = tone === 'light' ? 'text-teal-300' : 'text-teal-700'
  const link = tone === 'light' ? 'text-paper hover:text-teal-300' : 'text-navy-900 hover:text-teal-700'

  if (!phones.length && !emails.length && !address) {
    return <p>Contact details will be published once confirmed by NDEL.</p>
  }

  return (
    <dl className="grid gap-6">
      {address && (
        <div>
          <dt className={`eyebrow ${label}`}>{address.label || 'Office'}</dt>
          <dd className="mt-2 whitespace-pre-line">
            {address.lines}
            {!address.verified && <Unverified tone={tone} />}
          </dd>
        </div>
      )}
      {phones.length > 0 && (
        <div>
          <dt className={`eyebrow ${label}`}>Telephone</dt>
          {phones.map((p) => (
            <dd key={p.id ?? p.number} className="mt-2">
              <a href={telHref(p.number)} className={`font-medium underline-offset-4 hover:underline ${link}`}>
                {p.number}
              </a>
              {!p.verified && <Unverified tone={tone} />}
            </dd>
          ))}
        </div>
      )}
      {emails.length > 0 && (
        <div>
          <dt className={`eyebrow ${label}`}>Email</dt>
          {emails.map((e) => (
            <dd key={e.id ?? e.email} className="mt-2">
              <a href={`mailto:${e.email}`} className={`font-medium underline-offset-4 hover:underline ${link}`}>
                {e.email}
              </a>
              {!e.verified && <Unverified tone={tone} />}
            </dd>
          ))}
        </div>
      )}
      {info.hours && info.hours.length > 0 && (
        <div>
          <dt className={`eyebrow ${label}`}>Office hours</dt>
          {info.hours.map((h) => (
            <dd key={h.id ?? h.days} className="mt-2">
              {h.days}: {h.time}
            </dd>
          ))}
        </div>
      )}
    </dl>
  )
}
