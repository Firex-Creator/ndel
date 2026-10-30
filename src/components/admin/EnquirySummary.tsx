import type { ServerComponentProps } from 'payload'

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const

/** Enquiry counts at the top of the admin dashboard, scoped to what the user may see. */
export async function EnquirySummary({ payload, user }: ServerComponentProps) {
  if (!user) return null

  const counts = await Promise.all(
    STATUSES.map(async (s) => {
      const { totalDocs } = await payload.count({
        collection: 'enquiries',
        where: { status: { equals: s.value } },
        overrideAccess: false,
        user,
      })
      return { ...s, total: totalDocs }
    }),
  )

  return (
    <section style={{ marginBottom: 'calc(var(--base) * 2)' }} aria-labelledby="enquiry-summary-heading">
      <h2 id="enquiry-summary-heading" style={{ marginBottom: 'var(--base)' }}>
        Project enquiries
      </h2>
      <ul
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--base)',
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {counts.map((s) => (
          <li key={s.value}>
            <a
              href={`/admin/collections/enquiries?where[status][equals]=${s.value}`}
              style={{
                display: 'block',
                padding: 'var(--base)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 4,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ display: 'block', fontSize: 28, fontWeight: 600 }}>{s.total}</span>
              <span>{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
