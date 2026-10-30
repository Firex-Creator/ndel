import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Container, Eyebrow } from '@/components/site/ui'
import { DEMO_COOKIE, DEMO_COOKIE_MAX_AGE, demoGateMode, expectedDemoToken, safeEqual } from '@/lib/demo-access'

export const metadata: Metadata = { title: 'Demonstration access', robots: { index: false, follow: false } }

const safeNext = (next: unknown) =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/'

async function unlock(formData: FormData) {
  'use server'
  const next = safeNext(formData.get('next'))
  const password = String(formData.get('password') ?? '')
  const expected = process.env.DEMO_ACCESS_PASSWORD ?? ''
  if (demoGateMode() !== 'protected' || !safeEqual(password, expected)) {
    redirect(`/demo-access?error=1&next=${encodeURIComponent(next)}`)
  }
  const store = await cookies()
  store.set(DEMO_COOKIE, await expectedDemoToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DEMO_COOKIE_MAX_AGE,
  })
  redirect(next)
}

type Props = { searchParams: Promise<{ error?: string; next?: string }> }

export default async function DemoAccessPage({ searchParams }: Props) {
  const { error, next } = await searchParams
  const mode = demoGateMode()

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-lg border border-rule bg-white p-6 sm:p-10">
        <Eyebrow>Private proposal demonstration</Eyebrow>
        <h1 className="mt-4 text-3xl font-bold text-navy-900">Enter the access password</h1>
        <p className="mt-4 text-muted">
          This website is a private demonstration prepared by Metachain Software for NDEL. It is not publicly available.
        </p>
        {mode === 'misconfigured' ? (
          <p role="alert" className="mt-6 border-l-4 border-signal-dark bg-[#fff8f3] p-4">
            Access is disabled because no demonstration password has been configured on the server.
          </p>
        ) : (
          <form action={unlock} className="mt-8 grid gap-5">
            <input type="hidden" name="next" value={safeNext(next)} />
            <div>
              <label htmlFor="password" className="block font-semibold text-navy-900">
                Password
              </label>
              {error && (
                <p id="password-error" role="alert" className="mt-2 text-sm font-medium text-signal-dark">
                  The password is incorrect. Check it and try again.
                </p>
              )}
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'password-error' : undefined}
                className="mt-2 block min-h-12 w-full border border-navy-500 px-4 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-signal"
              />
            </div>
            <button type="submit" className="min-h-12 bg-navy-900 px-6 font-semibold text-paper hover:bg-navy-700">
              View demonstration
            </button>
          </form>
        )}
      </div>
    </Container>
  )
}
