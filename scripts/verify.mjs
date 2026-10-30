// End-to-end verification of the demonstration against a running server.
//   npm run dev   (in another terminal, with the database running and seeded)
//   npm run verify
// Uses Playwright (dev dependency) for browser journeys and fetch for API permission checks.
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

process.loadEnvFile('.env')
const BASE = process.env.VERIFY_BASE_URL || 'http://localhost:3000'
const OUT = path.resolve(process.env.VERIFY_OUT_DIR || '.local/verify')
mkdirSync(OUT, { recursive: true })

/** A small, structurally valid one-page PDF with a correct xref table. */
function minimalPdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>',
  ]
  let body = '%PDF-1.4\n'
  const offsets = objects.map((obj, i) => {
    const offset = Buffer.byteLength(body)
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`
    return offset
  })
  const xref = Buffer.byteLength(body)
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  body += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return body
}

let cleanup
const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`)
}
const step = async (name, fn) => {
  try {
    await fn()
  } catch (err) {
    check(name, false, String(err?.message ?? err).split('\n')[0])
  }
}

const PAGES = [
  '/',
  '/services',
  '/services/offshore-mooring-operations',
  '/projects',
  '/projects/sample-spm-mooring-line-replacement',
  '/safety-quality',
  '/about',
  '/insights',
  '/insights/what-to-include-in-a-subsea-inspection-enquiry',
  '/contact',
]

const browser = await chromium.launch()
const launchContext = browser.newContext.bind(browser)
browser.newContext = async (opts) => {
  const c = await launchContext(opts)
  c.setDefaultTimeout(90000) // first requests compile on demand in dev mode
  return c
}
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
const page = await ctx.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))

// ---------------------------------------------------------------- demo gate
await step('Demo gate', async () => {
  const res = await fetch(`${BASE}/`, { redirect: 'manual' })
  check('Unauthenticated visitor is redirected to /demo-access', res.status === 307 && res.headers.get('location')?.includes('/demo-access'))
  const api = await fetch(`${BASE}/api/services`)
  check('API without demo cookie returns 401', api.status === 401)
  const robots = await fetch(`${BASE}/robots.txt`)
  check('robots.txt disallows all in demo mode', (await robots.text()).includes('Disallow: /'))

  await page.goto(`${BASE}/about`)
  check('Gate preserves requested page', page.url().includes('/demo-access?next=%2Fabout'))
  await page.fill('#password', 'wrong-password')
  await page.click('button[type=submit]')
  await page.waitForURL(/error=1/)
  check('Wrong password shows an error', await page.locator('#password-error').isVisible())
  await page.fill('#password', process.env.DEMO_ACCESS_PASSWORD)
  await page.click('button[type=submit]')
  await page.waitForURL(`${BASE}/about`)
  check('Correct password unlocks and returns to requested page', page.url() === `${BASE}/about`)
})

const cookies = await ctx.cookies()
const demoCookie = cookies.find((c) => c.name === 'ndel_demo_access')
const cookieHeader = `ndel_demo_access=${demoCookie?.value}`
const api = (p, init = {}) =>
  fetch(`${BASE}${p}`, { ...init, headers: { Cookie: cookieHeader, ...(init.headers || {}) } })

// ------------------------------------------------------------- public pages
await step('Public pages', async () => {
  for (const p of PAGES) {
    const res = await page.goto(`${BASE}${p}`)
    const h1 = await page.locator('h1').first().textContent()
    check(`Page ${p} renders`, res?.status() === 200 && h1 && !page.url().includes('/demo-access'), h1?.trim().slice(0, 50))
  }
  const res = await api('/')
  check('Pages send X-Robots-Tag noindex', res.headers.get('x-robots-tag')?.includes('noindex'))
  const html = await res.text()
  check('Pages include robots noindex meta', /<meta name="robots" content="noindex/.test(html))
  check('Home page shows both primary actions', html.includes('Discuss Your Project') && html.includes('Explore Our Services'))
  const sitemap = await api('/sitemap.xml')
  check('Sitemap is generated', sitemap.status === 200 && (await sitemap.text()).includes('/services/offshore-mooring-operations'))
})

// --------------------------------------------------------- labelled content
await step('Sample content labelling', async () => {
  await page.goto(`${BASE}/projects`)
  check('Projects page shows demonstration notice', await page.getByText('Demonstration case studies.').isVisible())
  const badges = await page.getByText('Demonstration sample').count()
  check('Every demo project card is labelled', badges >= 5, `${badges} badges`)
  await page.goto(`${BASE}/services`)
  check('Unverified services are labelled pending', (await page.getByText('Pending NDEL verification').count()) >= 6)
  await page.goto(`${BASE}/contact`)
  check('Unconfirmed contact details are flagged', (await page.getByText('(from previous website, to be confirmed)').count()) > 0)
  check('No map shown while location unverified', (await page.locator('iframe[title*="Map"]').count()) === 0)
})

// -------------------------------------------------------- service preselect
await step('Service preselection', async () => {
  await page.goto(`${BASE}/services/marine-maintenance-and-salvage`)
  await page.getByRole('complementary', { name: 'Start an enquiry' }).getByRole('link', { name: /Discuss Your Project/ }).click()
  await page.waitForURL(/\/contact\?service=marine-maintenance-and-salvage/, { waitUntil: 'commit' })
  await page.locator('#service').waitFor()
  check('Service page enquiry preselects that service', (await page.locator('#service').inputValue()) === 'marine-maintenance-and-salvage')

  await page.goto(`${BASE}/projects/sample-jacket-inspection-cp-survey`)
  await page.getByRole('link', { name: 'Discuss Your Project', exact: true }).last().click()
  await page.waitForURL(/project=sample-jacket-inspection-cp-survey/, { waitUntil: 'commit' }); await page.locator('#service').waitFor()
  check('Project page enquiry preselects the project service', (await page.locator('#service').inputValue()) === 'asset-integrity-management')
  check('Project context shown on form', await page.getByText('Enquiry started from the case study').isVisible())

  await page.goto(`${BASE}/contact?service=not-a-real-service`)
  check('Unknown service parameter is ignored', (await page.locator('#service').inputValue()) === '')
})

// ----------------------------------------------------------- project filter
await step('Project filters', async () => {
  await page.goto(`${BASE}/projects`)
  const cards = page.locator('main ul li article')
  const total = await cards.count()
  check('All projects shown initially', total === 5, `${total}`)
  await page.getByRole('button', { name: 'Marine Maintenance and Salvage' }).click()
  await page.waitForTimeout(500)
  check('Service filter narrows results', (await cards.count()) === 1)
  check('Filter button exposes pressed state', (await page.getByRole('button', { name: 'Marine Maintenance and Salvage' }).getAttribute('aria-pressed')) === 'true')
  check('Filter state reflected in URL', page.url().includes('service=marine-maintenance-and-salvage'))
  await page.getByRole('group', { name: 'Service category' }).getByRole('button', { name: 'All' }).click()
  await page.getByRole('button', { name: 'In progress' }).click()
  await page.waitForTimeout(500)
  check('Status filter narrows results', (await cards.count()) === 2)
  check('Result count announced', (await page.getByRole('status').first().textContent())?.includes('Showing 2 of 5'))
  await page.goto(`${BASE}/projects?service=asset-integrity-management&status=completed`)
  check('Filters restore from URL', (await cards.count()) === 1)
})

// --------------------------------------------------------- enquiry journey
let reference = ''
await step('Enquiry journey', async () => {
  await page.goto(`${BASE}/contact?service=offshore-mooring-operations`)
  await page.getByRole('button', { name: 'Submit enquiry' }).click()
  const alert = page.locator('form [role=alert]')
  await alert.waitFor()
  check('Empty submission shows server-side error summary', (await alert.textContent())?.includes('problems with'))
  check('Error summary receives focus', await alert.evaluate((el) => el === document.activeElement))
  check('Invalid fields marked aria-invalid', (await page.locator('[aria-invalid=true]').count()) >= 5)
  check('Preselected service kept after failed submit', (await page.locator('#service').inputValue()) === 'offshore-mooring-operations')

  const fill = async () => {
    await page.fill('#name', 'Verification Tester')
    await page.fill('#company', 'Metachain Verification')
    await page.fill('#email', 'tester@example.com')
    await page.fill('#telephone', '+234 800 000 0000')
    await page.fill('#projectLocation', 'Bonny offshore terminal (test)')
    await page.fill('#description', 'AUTOMATED TEST ENQUIRY. Inspection of SPM mooring lines with possible replacement of two legs.')
    await page.check('#consent')
  }

  // Disguised executable: correct extension, wrong content.
  const fake = path.join(OUT, 'fake.pdf')
  writeFileSync(fake, 'MZ this is not a pdf')
  await fill()
  await page.setInputFiles('#attachment', fake)
  await page.getByRole('button', { name: 'Submit enquiry' }).click()
  await page.locator('#attachment-error').waitFor()
  check('Attachment with mismatched content is rejected', (await page.locator('#attachment-error').textContent())?.includes('does not match'))

  const exe = path.join(OUT, 'tool.exe')
  writeFileSync(exe, 'MZ')
  await page.setInputFiles('#attachment', exe)
  await page.check('#consent')
  await page.getByRole('button', { name: 'Submit enquiry' }).click()
  await page.locator('#attachment-error').filter({ hasText: 'not accepted' }).waitFor()
  check('Disallowed file type is rejected', true)

  const big = path.join(OUT, 'big.pdf')
  writeFileSync(big, Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(10 * 1024 * 1024 + 10)]))
  await page.setInputFiles('#attachment', big)
  await page.locator('#attachment-error').filter({ hasText: 'larger than 10 MB' }).waitFor()
  check('Oversized file is flagged in the browser before upload', (await page.locator('#attachment').inputValue()) === '')

  // Bypass the browser check (no change event) to prove the server enforces the limit.
  await page.evaluate(() => {
    const bytes = new Uint8Array(10 * 1024 * 1024 + 10)
    bytes.set([0x25, 0x50, 0x44, 0x46])
    const dt = new DataTransfer()
    dt.items.add(new File([bytes], 'big.pdf', { type: 'application/pdf' }))
    document.querySelector('#attachment').files = dt.files
  })
  await page.check('#consent')
  await page.getByRole('button', { name: 'Submit enquiry' }).click()
  await page.locator('form [role=alert]').filter({ hasText: 'problem with 1 field' }).waitFor()
  check('Oversized file is rejected by the server', (await page.locator('#attachment-error').textContent())?.includes('larger than 10 MB'))

  const pdf = path.join(OUT, 'scope.pdf')
  writeFileSync(pdf, minimalPdf())
  await fill()
  await page.setInputFiles('#attachment', pdf)
  await page.getByRole('button', { name: 'Submit enquiry' }).click()
  await page.getByText('Enquiry saved').waitFor({ timeout: 20000 })
  reference = (await page.locator('p.font-mono').first().textContent())?.trim() ?? ''
  check('Successful enquiry shows a reference', /^NDEL-\d{6}-[A-HJ-NP-Z2-9]{5}$/.test(reference), reference)
  check('Confirmation heading receives focus', await page.getByRole('heading', { name: /Your enquiry has been received/ }).evaluate((el) => el === document.activeElement))
  check('Does not claim an email was sent', await page.getByText('no email has been sent').isVisible())
  await page.screenshot({ path: path.join(OUT, 'enquiry-success.png'), fullPage: false })
})

// ----------------------------------------------------- privacy & permissions
await step('Public API cannot reach enquiries', async () => {
  const list = await api('/api/enquiries')
  check('Anonymous GET /api/enquiries is denied', list.status === 403, `${list.status}`)
  const create = await api('/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference: 'X', name: 'x', company: 'x', email: 'x@x.com', serviceLabel: 'x', projectLocation: 'x', description: 'x' }),
  })
  check('Anonymous POST /api/enquiries is denied', create.status === 403, `${create.status}`)
  const files = await api('/api/enquiry-attachments')
  check('Anonymous GET /api/enquiry-attachments is denied', files.status === 403, `${files.status}`)
  const users = await api('/api/users')
  check('Anonymous GET /api/users is denied', users.status === 403, `${users.status}`)
})

const login = async (email, password) => {
  const res = await api('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  return { token: json.token, user: json.user }
}

await step('Staff permissions', async () => {
  const admin = await login(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD)
  const editor = await login(process.env.SEED_EDITOR_EMAIL, process.env.SEED_EDITOR_PASSWORD)
  check('Admin and editor can sign in', admin.token && editor.token)
  const as = (who) => (p, init = {}) => api(p, { ...init, headers: { Authorization: `JWT ${who.token}`, ...(init.headers || {}) } })
  const asAdmin = as(admin)
  const asEditor = as(editor)

  const found = await (await asAdmin(`/api/enquiries?where[reference][equals]=${reference}&depth=1`)).json()
  const enquiry = found.docs?.[0]
  check('Submitted enquiry saved to database', enquiry?.reference === reference)
  check('Enquiry saved with status New and timestamp', enquiry?.status === 'new' && Boolean(enquiry?.createdAt))
  check('Enquiry records email as not configured', enquiry?.emailNotification === 'not-configured')
  check('Enquiry stores the preselected service', enquiry?.serviceLabel === 'Offshore Mooring Operations')

  const fileUrl = enquiry?.attachment?.url && new URL(enquiry.attachment.url, BASE).pathname
  check('Attachment linked to enquiry', Boolean(fileUrl), fileUrl)
  check('Attachment stored with reference-based filename', enquiry?.attachment?.filename?.startsWith(reference))
  const anonFile = await api(fileUrl)
  check('Attachment file denied to anonymous visitors', anonFile.status === 403, `${anonFile.status}`)
  const adminFile = await asAdmin(fileUrl)
  check('Attachment file available to admin', adminFile.status === 200 && (await adminFile.text()).startsWith('%PDF'))
  const editorFile = await asEditor(fileUrl)
  check('Attachment denied to unassigned editor', editorFile.status === 403, `${editorFile.status}`)

  const editorList = await (await asEditor('/api/enquiries?limit=100')).json()
  check(
    'Editor sees only enquiries assigned to them',
    editorList.docs.length > 0 && editorList.docs.every((d) => (d.assignedTo?.id ?? d.assignedTo) === editor.user.id),
    `${editorList.docs.length} visible`,
  )
  const editorDirect = await asEditor(`/api/enquiries/${enquiry.id}`)
  check('Editor cannot open an unassigned enquiry', editorDirect.status === 404 || editorDirect.status === 403, `${editorDirect.status}`)

  const assign = await asAdmin(`/api/enquiries/${enquiry.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedTo: editor.user.id, status: 'reviewing' }),
  })
  check('Admin can assign and change status', assign.status === 200)
  const editorFile2 = await asEditor(fileUrl)
  check('Attachment available once assigned to editor', editorFile2.status === 200)

  const note = await asEditor(`/api/enquiries/${enquiry.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'contacted', internalNotes: [{ note: 'Verification note from editor', author: admin.user.id }] }),
  })
  const noted = await note.json()
  const n = noted.doc?.internalNotes?.at(-1)
  check('Assigned editor can update status and add notes', note.status === 200 && noted.doc?.status === 'contacted')
  check('Note author is forced to the signed-in user', (n?.author?.id ?? n?.author) === editor.user.id && Boolean(n?.addedAt))

  const reassign = await asEditor(`/api/enquiries/${enquiry.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedTo: admin.user.id }),
  })
  const after = await (await asAdmin(`/api/enquiries/${enquiry.id}?depth=0`)).json()
  check('Editor cannot change assignment', after.assignedTo === editor.user.id, `editor PATCH ${reassign.status}`)

  const tamper = await asEditor(`/api/enquiries/${enquiry.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ internalNotes: [] }),
  })
  const kept = await (await asAdmin(`/api/enquiries/${enquiry.id}?depth=0`)).json()
  check('Saved notes cannot be deleted', kept.internalNotes?.length >= 1, `PATCH ${tamper.status}`)

  const del = await asEditor(`/api/enquiries/${enquiry.id}`, { method: 'DELETE' })
  check('Editor cannot delete enquiries', del.status === 403 || del.status === 404, `${del.status}`)
  const mkUser = await asEditor('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'x@example.com', password: 'Abcdefgh1!', name: 'x', roles: ['admin'] }),
  })
  check('Editor cannot create staff accounts', mkUser.status === 403, `${mkUser.status}`)
  const selfPromote = await asEditor(`/api/users/${editor.user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles: ['admin'] }),
  })
  const me = await (await asAdmin(`/api/users/${editor.user.id}`)).json()
  check('Editor cannot promote themselves', !me.roles.includes('admin'), `PATCH ${selfPromote.status}`)

  const svc = await asEditor('/api/services?limit=1')
  check('Editor can manage website content', svc.status === 200)

  // Clean up: remove every automated test enquiry and its attachment (also proves admin delete works).
  cleanup = async () => {
    const tests = await (await asAdmin('/api/enquiries?where[company][equals]=Metachain Verification&depth=0&limit=100')).json()
    for (const t of tests.docs) {
      await asAdmin(`/api/enquiries/${t.id}`, { method: 'DELETE' })
      if (t.attachment) await asAdmin(`/api/enquiry-attachments/${t.attachment}`, { method: 'DELETE' })
    }
    const gone = await asAdmin(fileUrl)
    check('Admin can delete enquiries and attachments (test data removed)', gone.status !== 200, `${tests.docs.length} removed, file now ${gone.status}`)
  }

  // Search
  const search = await (await asAdmin(`/api/enquiries?where[or][0][company][like]=Metachain&where[or][1][reference][like]=${reference}`)).json()
  check('Enquiry search by company/reference works', search.docs.some((d) => d.reference === reference))
  const byStatus = await (await asAdmin('/api/enquiries?where[status][equals]=contacted')).json()
  check('Enquiry filter by status works', byStatus.docs.every((d) => d.status === 'contacted'))
})

// ------------------------------------------------------------- admin UI
await step('Admin interface', async () => {
  const admin = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  await admin.addCookies([demoCookie])
  const ap = await admin.newPage()
  await ap.goto(`${BASE}/admin/login`)
  await ap.fill('#field-email', process.env.SEED_ADMIN_EMAIL)
  await ap.fill('#field-password', process.env.SEED_ADMIN_PASSWORD)
  await ap.click('button[type=submit]')
  await ap.getByRole('heading', { name: 'Project enquiries' }).waitFor({ timeout: 60000 })
  check('Admin dashboard shows enquiry summary', true)
  await ap.screenshot({ path: path.join(OUT, 'admin-dashboard.png') })
  await ap.goto(`${BASE}/admin/collections/enquiries`)
  await ap.getByText(reference).first().waitFor({ timeout: 60000 })
  check('Enquiry listed in staff dashboard', true)
  await ap.screenshot({ path: path.join(OUT, 'admin-enquiries.png') })
  await admin.close()
})

// ----------------------------------------------------------- keyboard
await step('Keyboard navigation', async () => {
  await page.goto(`${BASE}/`)
  await page.keyboard.press('Tab')
  check('First Tab reaches skip link', (await page.evaluate(() => document.activeElement?.textContent)) === 'Skip to main content')
  await page.keyboard.press('Enter')
  check('Skip link moves focus to main content', await page.evaluate(() => document.activeElement?.id === 'main' || location.hash === '#main'))
  // Every interactive element shows a visible focus indicator.
  await page.goto(`${BASE}/contact`)
  const missing = []
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body || el.tagName === 'NEXTJS-PORTAL') return null
      const s = getComputedStyle(el)
      const visible = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0
      const ring = s.boxShadow && s.boxShadow !== 'none'
      return { tag: el.tagName, id: el.id || el.textContent?.trim().slice(0, 30), ok: visible || ring }
    })
    if (info && !info.ok) missing.push(`${info.tag}#${info.id}`)
  }
  check('Focused elements show a focus indicator', missing.length === 0, missing.join(', '))
})

// ------------------------------------------------------------- mobile
await step('Mobile layouts', async () => {
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
  await mobile.addCookies([demoCookie])
  const mp = await mobile.newPage()
  const overflow = []
  for (const p of PAGES) {
    await mp.goto(`${BASE}${p}`)
    const w = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (w > 1) overflow.push(`${p} (+${w}px)`)
    await mp.screenshot({ path: path.join(OUT, `mobile${p.replace(/\//g, '_') || '_home'}.png`), fullPage: true })
  }
  check('No horizontal overflow at 375px on any page', overflow.length === 0, overflow.join(', '))

  await mp.goto(`${BASE}/`)
  const menu = mp.getByRole('button', { name: 'Menu' })
  check('Desktop navigation hidden on mobile', !(await mp.locator('header nav[aria-label=Main]').first().isVisible()))
  await menu.click()
  check('Menu button opens navigation', (await menu.getAttribute('aria-expanded')) === 'true')
  await mp.keyboard.press('Escape')
  check('Escape closes menu and returns focus', (await menu.getAttribute('aria-expanded')) === 'false' && (await menu.evaluate((el) => el === document.activeElement)))
  await menu.click()
  await mp.locator('header nav[id]').getByRole('link', { name: 'Projects' }).click()
  await mp.waitForURL(/\/projects/, { waitUntil: 'commit' })
  await mp.waitForTimeout(500)
  check('Mobile menu navigates', (await menu.getAttribute('aria-expanded')) === 'false')
  await mobile.close()
})

// ---------------------------------------------------------- reduced motion
await step('Reduced motion', async () => {
  const rm = await browser.newContext({ reducedMotion: 'reduce' })
  await rm.addCookies([demoCookie])
  const rp = await rm.newPage()
  await rp.goto(`${BASE}/`)
  const animated = await rp.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).animationName !== 'none').length,
  )
  check('Section entrances disabled with reduced motion', animated === 0, `${animated} animated`)
  const hidden = await rp.evaluate(() =>
    [...document.querySelectorAll('.reveal')].filter((el) => getComputedStyle(el).opacity === '0').length,
  )
  check('Content visible without animation', hidden === 0)
  await rm.close()

  const nojs = await browser.newContext({ javaScriptEnabled: false })
  await nojs.addCookies([demoCookie])
  const np = await nojs.newPage()
  await np.goto(`${BASE}/projects`)
  check('Projects visible with JavaScript disabled', (await np.locator('main article').count()) === 5)
  await nojs.close()
})

await step('Cleanup', async () => cleanup?.())

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

await browser.close()
const failed = results.filter((r) => !r.ok)
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ base: BASE, reference, results }, null, 2))
console.log(`\n${results.length - failed.length}/${results.length} checks passed. Screenshots and results in ${OUT}`)
process.exit(failed.length ? 1 : 0)
