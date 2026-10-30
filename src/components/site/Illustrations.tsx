/**
 * Illustrative mooring schematic for the home page hero. A generic line drawing
 * (not a depiction of an NDEL project), labelled as such for screen readers.
 */
export function MooringSchematic({ className = '' }: { className?: string }) {
  const label = 'fill-teal-300 font-mono text-[9px] tracking-wider'
  return (
    <svg
      viewBox="0 0 520 420"
      className={className}
      role="img"
      aria-labelledby="schematic-title schematic-desc"
      fill="none"
      stroke="currentColor"
    >
      <title id="schematic-title">Illustrative schematic of a single point mooring</title>
      <desc id="schematic-desc">
        A buoy at the sea surface held by catenary mooring lines to seabed anchors, with an ROV inspecting a line.
      </desc>

      {/* depth scale */}
      <g className="text-paper/25" strokeWidth="1">
        <path d="M30 110 V380" />
        {[110, 165, 220, 275, 330, 380].map((y) => (
          <path key={y} d={`M30 ${y} h8`} />
        ))}
      </g>
      <g className="fill-paper/40 font-mono text-[8px]" stroke="none">
        <text x="42" y="113">0 m</text>
        <text x="42" y="383">SEABED</text>
      </g>

      {/* sea surface */}
      <path
        className="text-teal-300"
        strokeWidth="1.5"
        d="M20 110 Q 45 102 70 110 T 120 110 T 170 110 T 220 110 T 270 110 T 320 110 T 370 110 T 420 110 T 470 110 T 520 110"
      />

      {/* tanker hull, faint */}
      <path className="text-paper/30" strokeWidth="1.25" d="M340 108 L 352 86 H 500 V 108" />

      {/* buoy */}
      <g className="text-paper" strokeWidth="1.75">
        <path d="M232 96 h56 l-6 22 h-44z" />
        <path d="M260 96 V78 M252 78 h16" />
      </g>
      <path className="text-signal" strokeWidth="2" d="M288 100 Q 315 98 340 104" />

      {/* catenary legs */}
      <g className="text-paper/80" strokeWidth="1.5">
        <path d="M240 118 C 200 220, 140 330, 70 378" />
        <path d="M280 118 C 320 220, 400 330, 470 378" />
        <path d="M260 118 C 262 240, 270 320, 300 378" strokeDasharray="5 5" />
      </g>

      {/* seabed + anchors */}
      <path className="text-paper/40" strokeWidth="1.25" d="M20 380 H520" />
      <g className="text-paper/40" strokeWidth="1">
        {Array.from({ length: 24 }, (_, i) => (
          <path key={i} d={`M${24 + i * 21} 380 l-8 10`} />
        ))}
      </g>
      <g className="fill-signal" stroke="none">
        <rect x="62" y="372" width="14" height="8" />
        <rect x="463" y="372" width="14" height="8" />
        <rect x="293" y="372" width="14" height="8" />
      </g>

      {/* ROV */}
      <g className="text-teal-300" strokeWidth="1.5">
        <rect x="372" y="236" width="44" height="22" />
        <path d="M372 258 l-8 8 M416 258 l8 8 M394 236 V212" />
        <circle cx="366" cy="247" r="3" />
        <path d="M363 247 L 336 262" strokeDasharray="2 4" />
        <path d="M394 212 C 394 170, 360 150, 330 112" strokeDasharray="3 5" />
      </g>

      {/* callouts */}
      <g className="text-paper/45" strokeWidth="0.75">
        <path d="M292 82 L 330 50 H 410" />
        <path d="M160 260 L 104 238 H 60" />
        <path d="M420 236 L 450 200 H 500" />
      </g>
      <g className={label} stroke="none">
        <text x="334" y="45">BUOY / SPM</text>
        <text x="60" y="232">CATENARY LINE</text>
        <text x="452" y="194">ROV</text>
      </g>
    </svg>
  )
}

const defaultSteps = [
  { title: 'Scope', description: 'Clarify the objective, site conditions, constraints and the information available.' },
  { title: 'Engineer', description: 'Survey, analysis and method statements; equipment and personnel selection.' },
  { title: 'Plan & assess', description: 'Risk assessment, permits, HSE planning and client review before mobilisation.' },
  { title: 'Execute', description: 'Mobilise vessels, divers, ROV or teams and carry out the work to the agreed method.' },
  { title: 'Report', description: 'Inspection data, records and close-out reporting handed over to the client.' },
]

/**
 * Simple numbered process illustration. Uses an ordered list so the sequence is
 * conveyed to assistive technology, with a connecting rule drawn in CSS.
 */
export function ProcessDiagram({
  steps = defaultSteps,
  tone = 'dark',
}: {
  steps?: { title: string; description?: string | null }[]
  tone?: 'dark' | 'light'
}) {
  const onDark = tone === 'light'
  return (
    <ol
      className={`relative grid gap-8 md:gap-6 ${
        steps.length >= 5 ? 'md:grid-cols-5' : steps.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
      }`}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="reveal relative pl-14 md:pl-0 md:pt-14">
          {/* connector */}
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-[1.15rem] top-10 bottom-[-2rem] w-px md:left-10 md:right-[-1.5rem] md:top-[1.15rem] md:bottom-auto md:h-px md:w-auto ${
                onDark ? 'bg-paper/25' : 'bg-rule'
              }`}
            />
          )}
          <span
            aria-hidden="true"
            className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center border-2 font-mono text-sm font-medium ${
              onDark ? 'border-teal-300 bg-navy-900 text-paper' : 'border-navy-900 bg-paper text-navy-900'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
            {i === 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 bg-signal" />}
          </span>
          <h3 className={`text-lg font-bold ${onDark ? 'text-paper' : 'text-navy-900'}`}>
            <span className="sr-only">Step {i + 1}: </span>
            {step.title}
          </h3>
          {step.description && (
            <p className={`mt-2 text-[0.95rem] ${onDark ? 'text-paper/75' : 'text-muted'}`}>{step.description}</p>
          )}
        </li>
      ))}
    </ol>
  )
}
