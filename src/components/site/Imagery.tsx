import type { Media } from '@/payload-types'

/**
 * Responsive CMS image built from Payload's generated sizes. Uses a plain <img>
 * with srcset so files are served through Payload's access-controlled file route.
 */
export function CmsImage({
  media,
  sizes = '100vw',
  className = '',
  priority = false,
}: {
  media: Media
  sizes?: string
  className?: string
  priority?: boolean
}) {
  const candidates = [media.sizes?.thumb, media.sizes?.card, media.sizes?.hero]
    .filter((s): s is NonNullable<typeof s> => Boolean(s?.url && s.width))
    .map((s) => `${s.url} ${s.width}w`)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.sizes?.card?.url || media.url || ''}
      srcSet={candidates.length ? candidates.join(', ') : undefined}
      sizes={sizes}
      alt={media.alt}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
      style={media.focalX != null ? { objectPosition: `${media.focalX}% ${media.focalY}%` } : undefined}
    />
  )
}

const motifs = {
  mooring: (
    <g>
      <path d="M0 70 Q 50 62 100 70 T 200 70 T 300 70 T 400 70" />
      <path d="M190 58 h20 v12 h-20z" />
      <path d="M200 70 C 170 120, 110 170, 40 196" />
      <path d="M200 70 C 230 120, 290 170, 360 196" />
      <path d="M0 200 H400" strokeDasharray="4 6" />
    </g>
  ),
  diving: (
    <g>
      <path d="M0 50 Q 50 42 100 50 T 200 50 T 300 50 T 400 50" />
      <path d="M200 50 V120" strokeDasharray="3 5" />
      <rect x="172" y="120" width="56" height="28" />
      <path d="M180 148 l-10 14 M220 148 l10 14" />
      <path d="M0 196 H400" strokeDasharray="4 6" />
      <path d="M290 196 v-40 h40 v40" />
    </g>
  ),
  integrity: (
    <g>
      <path d="M40 120 H360" strokeWidth="10" />
      <circle cx="200" cy="120" r="36" />
      <path d="M200 70 v14 M200 156 v14 M150 120 h14 M236 120 h14" />
      <path d="M60 170 h80 M60 182 h50" />
    </g>
  ),
  wind: (
    <g>
      <path d="M0 150 Q 50 142 100 150 T 200 150 T 300 150 T 400 150" />
      <path d="M200 150 V60" strokeWidth="4" />
      <path d="M200 60 L200 10 M200 60 L157 85 M200 60 L243 85" />
      <path d="M200 150 V200 M180 200 H220" />
    </g>
  ),
  salvage: (
    <g>
      <path d="M0 60 Q 50 52 100 60 T 200 60 T 300 60 T 400 60" />
      <path d="M120 60 V40 h60 V20" />
      <path d="M180 20 L260 20 M250 20 V130" strokeDasharray="3 5" />
      <path d="M190 170 L310 150 L320 175 L200 195 Z" />
    </g>
  ),
  epcic: (
    <g>
      <path d="M0 160 Q 50 152 100 160 T 200 160 T 300 160 T 400 160" />
      <path d="M140 160 V80 H260 V160 M150 80 L200 40 L250 80" />
      <path d="M160 100 h80 M160 120 h80 M160 140 h80" />
      <path d="M160 160 L140 205 M240 160 L260 205" />
    </g>
  ),
}

export type Motif = keyof typeof motifs

/**
 * Clearly identified placeholder used until licensed or NDEL-owned photography
 * is supplied. The line drawing is a generic schematic, not a depiction of real work.
 */
export function ImagePlaceholder({
  label,
  motif = 'mooring',
  className = '',
  showCaption = true,
}: {
  label: string
  motif?: Motif
  className?: string
  showCaption?: boolean
}) {
  return (
    <figure
      className={`relative flex h-full min-h-48 w-full flex-col justify-end overflow-hidden bg-navy-800 text-paper ${className}`}
    >
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full text-teal-300/45"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        role="img"
        aria-label={`Placeholder schematic: ${label}`}
      >
        <defs>
          <pattern id={`g-${motif}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" stroke="#f6f4ef" strokeOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="400" height="220" fill={`url(#g-${motif})`} stroke="none" />
        {motifs[motif]}
      </svg>
      {showCaption && (
        <figcaption className="relative m-3 self-start bg-navy-950/85 px-2 py-1 font-mono text-[0.68rem] tracking-wide text-paper/80">
          Image placeholder: {label}. Photography to be supplied.
        </figcaption>
      )}
    </figure>
  )
}

const slugMotifs: Record<string, Motif> = {
  'offshore-mooring-operations': 'mooring',
  'commercial-diving-and-rov-services': 'diving',
  'asset-integrity-management': 'integrity',
  'offshore-wind-farm-support': 'wind',
  'marine-maintenance-and-salvage': 'salvage',
  'turnkey-epcic-services': 'epcic',
}

export const motifFor = (slug?: string | null): Motif => (slug && slugMotifs[slug]) || 'mooring'

/** Shows the CMS image when one exists, otherwise a labelled placeholder. */
export function VisualOrPlaceholder({
  media,
  label,
  motif,
  sizes,
  className = '',
  priority,
}: {
  media: Media | number | null | undefined
  label: string
  motif: Motif
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (media && typeof media === 'object' && media.url) {
    return (
      <div className={`overflow-hidden bg-navy-800 ${className}`}>
        <CmsImage media={media} sizes={sizes} priority={priority} />
      </div>
    )
  }
  return <ImagePlaceholder label={label} motif={motif} className={className} />
}
