import { type NextRequest, NextResponse } from 'next/server'

import { DEMO_COOKIE, demoGateMode, expectedDemoToken, safeEqual } from '@/lib/demo-access'

const isDemo = process.env.SITE_MODE !== 'live'

/**
 * Proposal demonstration gate. Every page, the admin and the API require the
 * demo-access cookie; responses are marked noindex while in demo mode.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const mode = demoGateMode()

  const withHeaders = (res: NextResponse) => {
    if (isDemo) res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return res
  }

  if (mode === 'open' || pathname === '/demo-access') return withHeaders(NextResponse.next())

  if (mode === 'protected') {
    const token = request.cookies.get(DEMO_COOKIE)?.value
    if (token && safeEqual(token, await expectedDemoToken())) return withHeaders(NextResponse.next())
  }

  if (pathname.startsWith('/api/')) {
    return withHeaders(NextResponse.json({ error: 'Demonstration access required' }, { status: 401 }))
  }

  const url = request.nextUrl.clone()
  url.pathname = '/demo-access'
  url.search = ''
  if (pathname !== '/') url.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
  return withHeaders(NextResponse.redirect(url))
}

export const config = {
  // Skip Next.js internals and static files served from /public.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)'],
}
