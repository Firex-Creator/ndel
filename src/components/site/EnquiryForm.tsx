'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type React from 'react'

import { submitEnquiry } from '@/app/(frontend)/contact/actions'
import type { EnquiryFieldErrors, EnquiryState } from '@/lib/enquiry'

type Props = {
  services: { value: string; label: string }[]
  defaultService?: string
  sourcePage?: string
  projectTitle?: string
}

const MAX_BYTES = 10 * 1024 * 1024
const ATTACHMENT_HINT = 'PDF, Word (.docx), Excel (.xlsx), JPG or PNG, up to 10 MB.'
const FIELD_ORDER: (keyof EnquiryFieldErrors)[] = [
  'name',
  'company',
  'email',
  'telephone',
  'service',
  'projectLocation',
  'anticipatedStart',
  'description',
  'attachment',
  'consent',
]

const input =
  'mt-2 block w-full min-h-12 border border-navy-500 bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 focus:border-navy-900 focus:outline-3 focus:outline-offset-2 focus:outline-signal focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-signal aria-[invalid=true]:border-signal-dark aria-[invalid=true]:bg-[#fff8f3]'

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold text-navy-900">
        {label}
        {optional && <span className="ml-2 text-sm font-normal text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex gap-2 text-sm font-medium text-signal-dark">
          <span aria-hidden="true">▲</span>
          {error}
        </p>
      )}
      {children}
    </div>
  )
}

const describedBy = (id: string, hasHint: boolean, error?: string) =>
  [hasHint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="inline-flex min-h-13 w-full items-center justify-center gap-3 bg-navy-900 px-8 py-3 text-base font-semibold text-paper transition-colors hover:bg-navy-700 disabled:cursor-wait disabled:bg-navy-700 sm:w-auto"
    >
      {pending ? (
        <>
          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-paper/40 border-t-paper motion-reduce:animate-none" />
          Saving your enquiry…
        </>
      ) : (
        <>
          <span aria-hidden="true" className="h-3 w-3 bg-signal" />
          Submit enquiry
        </>
      )}
    </button>
  )
}

function PendingStatus() {
  const { pending } = useFormStatus()
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {pending ? 'Submitting your enquiry. Please wait.' : ''}
    </p>
  )
}

function Success({ state }: { state: Extract<EnquiryState, { status: 'success' }> }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copied, setCopied] = useState(false)
  useEffect(() => headingRef.current?.focus(), [])

  return (
    <div className="border-2 border-teal-600 bg-white p-6 sm:p-10">
      <p className="eyebrow flex items-center gap-2 text-teal-700">
        <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 8.5l3 3 7-7" />
        </svg>
        Enquiry saved
      </p>
      <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl font-bold text-navy-900 focus:outline-none">
        Thank you. Your enquiry has been received.
      </h2>
      <p className="mt-6 text-muted">Your enquiry reference is</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <p className="font-mono text-2xl font-medium tracking-wider text-navy-900 sm:text-3xl">{state.reference}</p>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(state.reference)
              setCopied(true)
            } catch {
              setCopied(false)
            }
          }}
          className="min-h-11 border border-navy-900 px-4 text-sm font-semibold text-navy-900 hover:bg-navy-900 hover:text-paper"
        >
          {copied ? 'Copied' : 'Copy reference'}
        </button>
      </div>
      <p className="mt-6 max-w-2xl">
        Please quote this reference in any correspondence. Your enquiry is stored securely and is visible only to
        authorised NDEL staff.
      </p>
      <p className="mt-4 max-w-2xl border-l-4 border-rule pl-4 text-[0.95rem] text-muted">
        {state.emailStatus === 'sent'
          ? 'The NDEL team has been notified by email.'
          : state.emailStatus === 'failed'
            ? 'Your enquiry was saved, but the automatic staff email notification could not be sent. Staff will see your enquiry in the enquiry dashboard.'
            : 'Your enquiry was saved. Email notifications are not configured on this demonstration site, so no email has been sent to you or to staff. Staff will see your enquiry in the enquiry dashboard.'}
      </p>
    </div>
  )
}

export function EnquiryForm({ services, defaultService, sourcePage, projectTitle }: Props) {
  const [state, action] = useActionState(submitEnquiry, { status: 'idle' })
  const summaryRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const [descLength, setDescLength] = useState(0)
  const [fileError, setFileError] = useState('')

  const errors: EnquiryFieldErrors = state.status === 'error' ? state.fieldErrors : {}
  const values = state.status === 'error' ? state.values : {}
  const errorKeys = FIELD_ORDER.filter((k) => errors[k])

  useEffect(() => {
    if (state.status === 'error') summaryRef.current?.focus()
  }, [state])

  const fade = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.25 } }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === 'success' ? (
        <motion.div key="success" {...fade}>
          <Success state={state} />
        </motion.div>
      ) : (
        <motion.div key="form" {...fade}>
          <form
            // Remount after each failed attempt so fields show the submitted values.
            key={state.status === 'error' ? JSON.stringify(values) : 'initial'}
            action={action}
            noValidate
            className="grid gap-10"
            aria-describedby="form-intro"
          >
            <p id="form-intro" className="text-muted">
              Fields are required unless marked optional.
            </p>

            {state.status === 'error' && (
              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                className="border-2 border-signal-dark bg-[#fff8f3] p-5 focus:outline-none focus:ring-2 focus:ring-signal"
              >
                <h2 className="text-lg font-bold text-navy-900">{state.message}</h2>
                {errorKeys.length > 0 && (
                  <ul className="mt-3 grid gap-1">
                    {errorKeys.map((k) => (
                      <li key={k}>
                        <a href={`#${k}`} className="text-signal-dark underline underline-offset-4">
                          {errors[k]}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {values.name !== undefined && (
                  <p className="mt-3 text-sm text-muted">If you attached a file, please select it again.</p>
                )}
              </div>
            )}

            {projectTitle && (
              <p className="border-l-4 border-teal-600 bg-teal-100/50 px-4 py-3 text-[0.95rem]">
                Enquiry started from the case study <strong>{projectTitle}</strong>.
              </p>
            )}

            <fieldset className="grid gap-6">
              <legend className="mb-6 font-display text-2xl font-bold text-navy-900">About you</legend>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="name" label="Full name" error={errors.name}>
                  <input id="name" name="name" autoComplete="name" required defaultValue={values.name} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name', false, errors.name)} className={input} />
                </Field>
                <Field id="company" label="Company or organisation" error={errors.company}>
                  <input id="company" name="company" autoComplete="organization" required defaultValue={values.company} aria-invalid={Boolean(errors.company)} aria-describedby={describedBy('company', false, errors.company)} className={input} />
                </Field>
                <Field id="email" label="Work email" error={errors.email}>
                  <input id="email" name="email" type="email" autoComplete="email" required defaultValue={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email', false, errors.email)} className={input} />
                </Field>
                <Field id="telephone" label="Telephone" optional hint="Include the country code, for example +234." error={errors.telephone}>
                  <input id="telephone" name="telephone" type="tel" autoComplete="tel" defaultValue={values.telephone} aria-invalid={Boolean(errors.telephone)} aria-describedby={describedBy('telephone', true, errors.telephone)} className={input} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="grid gap-6">
              <legend className="mb-6 font-display text-2xl font-bold text-navy-900">About the project</legend>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id="service" label="Service required" error={errors.service}>
                  <select id="service" name="service" required defaultValue={values.service ?? defaultService ?? ''} aria-invalid={Boolean(errors.service)} aria-describedby={describedBy('service', false, errors.service)} className={input}>
                    <option value="" disabled>
                      Select a service
                    </option>
                    {services.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                    <option value="other">Other / not sure</option>
                  </select>
                </Field>
                <Field id="projectLocation" label="Project location" hint="Field, terminal, port, region or coordinates." error={errors.projectLocation}>
                  <input id="projectLocation" name="projectLocation" required defaultValue={values.projectLocation} aria-invalid={Boolean(errors.projectLocation)} aria-describedby={describedBy('projectLocation', true, errors.projectLocation)} className={input} />
                </Field>
                <Field id="anticipatedStart" label="Anticipated start date" optional error={errors.anticipatedStart}>
                  <input id="anticipatedStart" name="anticipatedStart" type="date" defaultValue={values.anticipatedStart} aria-invalid={Boolean(errors.anticipatedStart)} aria-describedby={describedBy('anticipatedStart', false, errors.anticipatedStart)} className={input} />
                </Field>
              </div>
              <Field
                id="description"
                label="Project description"
                hint="What needs to be done, water depth or asset type if known, constraints and timescales. At least 30 characters."
                error={errors.description}
              >
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={7}
                  maxLength={5000}
                  defaultValue={values.description}
                  onChange={(e) => setDescLength(e.target.value.length)}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={[describedBy('description', true, errors.description), 'description-count'].filter(Boolean).join(' ')}
                  className={`${input} resize-y`}
                />
                <p id="description-count" className="mt-1 text-right font-mono text-xs text-muted">
                  {descLength || values.description?.length || 0} / 5,000
                </p>
              </Field>
              <Field id="attachment" label="Supporting document" optional hint={ATTACHMENT_HINT} error={fileError || errors.attachment}>
                <input
                  id="attachment"
                  name="attachment"
                  type="file"
                  // Early, friendly feedback only; the server performs the authoritative checks.
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0]
                    setFileError(file && file.size > MAX_BYTES ? `The file is larger than 10 MB. Choose a smaller file.` : '')
                    if (file && file.size > MAX_BYTES) e.currentTarget.value = ''
                  }}
                  accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  aria-invalid={Boolean(errors.attachment)}
                  aria-describedby={describedBy('attachment', true, errors.attachment)}
                  className={`${input} file:mr-4 file:min-h-9 file:border-0 file:bg-navy-900 file:px-4 file:font-semibold file:text-paper`}
                />
              </Field>
            </fieldset>

            <div className="grid gap-4">
              <div className="flex gap-3">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  required
                  defaultChecked={values.consent === 'on'}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                  className="mt-1 h-6 w-6 shrink-0 accent-navy-900"
                />
                <div>
                  <label htmlFor="consent" className="font-medium text-navy-900">
                    I agree that NDEL may store and use these details to respond to my enquiry.
                  </label>
                  {errors.consent && (
                    <p id="consent-error" className="mt-1 text-sm font-medium text-signal-dark">
                      {errors.consent}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted">
                    Your enquiry and any attachment are visible only to authorised NDEL staff and are not shared with
                    third parties.
                  </p>
                </div>
              </div>
            </div>

            {/* Honeypot for automated submissions; hidden from people and assistive technology. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {sourcePage && <input type="hidden" name="sourcePage" value={sourcePage} />}

            <div>
              <SubmitButton />
              <PendingStatus />
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
