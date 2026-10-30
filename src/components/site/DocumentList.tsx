import type { Document } from '@/payload-types'

import { formatDate } from './Cards'

const size = (bytes?: number | null) =>
  bytes ? (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`) : ''

export function DocumentList({ documents }: { documents: Document[] }) {
  return (
    <ul className="grid gap-px border border-rule bg-rule">
      {documents.map((d) => (
        <li key={d.id} className="flex flex-col gap-3 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-navy-900">{d.title}</p>
            <p className="mt-1 text-sm text-muted">
              {[d.issuingBody, d.certificateNumber && `No. ${d.certificateNumber}`, d.validUntil && `Valid until ${formatDate(d.validUntil)}`]
                .filter(Boolean)
                .join(' · ') || d.description}
            </p>
          </div>
          <a
            href={d.url!}
            download
            className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-navy-900 px-4 text-sm font-semibold text-navy-900 hover:bg-navy-900 hover:text-paper"
          >
            Download PDF<span className="sr-only">: {d.title}</span>
            {d.filesize ? <span className="font-normal opacity-75">({size(d.filesize)})</span> : null}
          </a>
        </li>
      ))}
    </ul>
  )
}
