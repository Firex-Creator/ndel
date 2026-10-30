'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import type React from 'react'

type Item = { id: number; serviceSlugs: string[]; status: string; card: React.ReactNode }
type Option = { value: string; label: string }

function FilterGroup({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string
  options: Option[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-teal-700">{legend}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {[{ value: 'all', label: 'All' }, ...options].map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className="min-h-11 border border-rule bg-white px-4 text-sm font-medium text-navy-900 transition-colors hover:border-navy-900 aria-pressed:border-navy-900 aria-pressed:bg-navy-900 aria-pressed:text-paper"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function ProjectFilter({
  items,
  services,
  statuses,
  initialService = 'all',
  initialStatus = 'all',
}: {
  items: Item[]
  services: Option[]
  statuses: Option[]
  initialService?: string
  initialStatus?: string
}) {
  const [service, setService] = useState(services.some((s) => s.value === initialService) ? initialService : 'all')
  const [status, setStatus] = useState(statuses.some((s) => s.value === initialStatus) ? initialStatus : 'all')
  const reduceMotion = useReducedMotion()

  const visible = useMemo(
    () =>
      items.filter(
        (i) => (service === 'all' || i.serviceSlugs.includes(service)) && (status === 'all' || i.status === status),
      ),
    [items, service, status],
  )

  // Keep the URL shareable without adding history entries or scrolling.
  const sync = (nextService: string, nextStatus: string) => {
    const params = new URLSearchParams()
    if (nextService !== 'all') params.set('service', nextService)
    if (nextStatus !== 'all') params.set('status', nextStatus)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.2, 0, 0, 1] as const }

  return (
    <div>
      <div className="grid gap-6 border-b border-rule pb-8 lg:grid-cols-[2fr_1fr]">
        <FilterGroup
          legend="Service category"
          options={services}
          value={service}
          onChange={(v) => {
            setService(v)
            sync(v, status)
          }}
        />
        <FilterGroup
          legend="Project status"
          options={statuses}
          value={status}
          onChange={(v) => {
            setStatus(v)
            sync(service, v)
          }}
        />
      </div>

      <p className="mt-6 text-sm text-muted" role="status" aria-live="polite">
        Showing {visible.length} of {items.length} {items.length === 1 ? 'project' : 'projects'}
      </p>

      <motion.ul layout={!reduceMotion} className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((item) => (
            <motion.li
              key={item.id}
              layout={!reduceMotion}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={transition}
            >
              {item.card}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <div className="mt-6 border border-dashed border-rule p-10 text-center">
          <p className="font-medium text-navy-900">No projects match these filters.</p>
          <button
            type="button"
            className="mt-4 min-h-11 font-semibold text-teal-700 underline underline-offset-4"
            onClick={() => {
              setService('all')
              setStatus('all')
              sync('all', 'all')
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
