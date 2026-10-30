/**
 * Seeds the demonstration database. Safe to re-run: it replaces seeded content
 * and sample enquiries (references starting NDEL-DEMO-) but keeps real enquiries.
 *
 *   npm run seed
 */
import config from '@payload-config'
import { getPayload } from 'payload'

import { claimsAwaitingEvidence, projects, safetySections, services, team } from './data'
import { doc, h2, p, ul } from './lexical'

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

const required = (name: string) => {
  const v = process.env[name]
  if (!v) throw new Error(`${name} must be set in .env to seed staff accounts.`)
  return v
}

async function upsertUser(email: string, password: string, name: string, roles: ('admin' | 'editor')[]) {
  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (docs[0]) {
    return payload.update({ collection: 'users', id: docs[0].id, data: { name, roles, password } })
  }
  return payload.create({ collection: 'users', data: { email, password, name, roles } })
}

async function clear(collection: 'services' | 'projects' | 'articles' | 'team-members') {
  await payload.delete({ collection, where: { id: { exists: true } } })
}

// ---- staff accounts --------------------------------------------------------
const admin = await upsertUser(required('SEED_ADMIN_EMAIL'), required('SEED_ADMIN_PASSWORD'), 'Demo Administrator', ['admin'])
const editor = await upsertUser(required('SEED_EDITOR_EMAIL'), required('SEED_EDITOR_PASSWORD'), 'Demo Editor', ['editor'])
log('staff accounts ready')

// ---- sample enquiries (remove before replacing services they reference) ----
await payload.delete({ collection: 'enquiries', where: { reference: { like: 'NDEL-DEMO-' } } })

// ---- content ---------------------------------------------------------------
await clear('articles')
await clear('projects')
await clear('services')
await clear('team-members')

const serviceIds: Record<string, number> = {}
for (const s of services) {
  const created = await payload.create({ collection: 'services', data: s })
  serviceIds[s.slug] = created.id
}
log(`${services.length} services`)

for (const pr of projects) {
  await payload.create({
    collection: 'projects',
    data: { ...pr, services: pr.services.map((slug) => serviceIds[slug]) },
  })
}
log(`${projects.length} demonstration projects`)

for (const m of team) await payload.create({ collection: 'team-members', data: m })
log(`${team.length} team profiles (pending verification)`)

const articles = [
  {
    title: 'What to include in a subsea inspection enquiry',
    slug: 'what-to-include-in-a-subsea-inspection-enquiry',
    excerpt: 'The information that helps an engineering team scope inspection work quickly and accurately.',
    publishedDate: '2026-09-15T00:00:00.000Z',
    relatedServices: [serviceIds['commercial-diving-and-rov-services'], serviceIds['asset-integrity-management']],
    body: doc(
      p('A clear enquiry shortens the time it takes to agree a scope and a price. The points below are general guidance for anyone requesting subsea inspection work.'),
      h2('Describe the asset'),
      ul(['Type of structure or pipeline and its approximate age.', 'Water depth and location.', 'Any previous inspection reports or drawings.']),
      h2('State what you need to know'),
      p('Explain the decision the inspection will support, for example a maintenance plan, a regulatory submission or a repair. This determines the inspection type and level of detail.'),
      h2('Note constraints'),
      ul(['Operational windows and access restrictions.', 'Simultaneous operations on site.', 'Required start and completion dates.']),
    ),
  },
  {
    title: 'Planning a mooring system inspection',
    slug: 'planning-a-mooring-system-inspection',
    excerpt: 'General points to consider before inspecting mooring lines, anchors and buoys.',
    publishedDate: '2026-08-20T00:00:00.000Z',
    relatedServices: [serviceIds['offshore-mooring-operations']],
    body: doc(
      p('Mooring systems are inspected to confirm that each component can continue to hold the floating asset safely. Planning determines how much useful information an inspection produces.'),
      h2('Gather the records'),
      p('Collect the original design basis, as-installed records and previous inspection results so that changes can be measured rather than estimated.'),
      h2('Agree the inspection method'),
      p('The choice between diver, ROV and topside inspection depends on water depth, the components involved and the measurements required.'),
    ),
  },
].map((a) => ({
  ...a,
  authorName: 'Demonstration author',
  published: true,
  contentSource: 'demonstration' as const,
  verificationNote: 'Demonstration article. Replace with NDEL-authored content before launch.',
}))
for (const a of articles) await payload.create({ collection: 'articles', data: a })
log(`${articles.length} demonstration articles`)

// ---- globals ---------------------------------------------------------------
await payload.updateGlobal({
  slug: 'company',
  data: {
    displayName: 'NDEL',
    registeredName: '',
    registeredNameConfirmed: false,
    overviewStatus: 'pending',
    overview: [
      {
        paragraph:
          'NDEL is a Nigerian engineering business providing subsea, marine and offshore services. Its head office is in Port Harcourt, Rivers State.',
      },
      {
        paragraph:
          'The company works across offshore mooring, commercial diving and ROV services, asset integrity management, offshore wind support, marine maintenance and salvage, and turnkey EPCIC projects.',
      },
    ],
    operatingApproach: [
      { title: 'Plan before mobilising', description: 'Define scope, risks and methods with the client before work starts.' },
      { title: 'Competent people', description: 'Assign personnel with the training and certification the task requires.' },
      { title: 'Documented methods', description: 'Carry out work to written, reviewed method statements.' },
      { title: 'Clear reporting', description: 'Hand over records and findings the client can act on.' },
    ],
    credentials: [],
    companyProfile: null,
    claimsAwaitingEvidence,
  },
})

await payload.updateGlobal({
  slug: 'contact-info',
  data: {
    address: {
      label: 'Head office',
      lines: '6 Gideon Ekeuwei Street\nPeter Odili Road\nPort Harcourt, Rivers State\nNigeria',
      verified: false,
    },
    phones: [{ label: 'Main line', number: '+234 703 921 7475', verified: false }],
    emails: [{ label: 'General enquiries', email: 'info@ndsubsea.ng', verified: false }],
    hours: [
      { days: 'Monday to Friday', time: '08:00 to 18:00' },
      { days: 'Saturday', time: '10:00 to 16:00' },
    ],
    map: { latitude: null, longitude: null, locationVerified: false },
  },
})

await payload.updateGlobal({
  slug: 'safety-quality',
  data: {
    introduction:
      'How NDEL manages health, safety, environmental protection and quality. Each area is supported by a published NDEL document.',
    sections: safetySections,
  },
})
log('globals updated')

// ---- sample enquiries -------------------------------------------------------
const sampleEnquiries = [
  {
    reference: 'NDEL-DEMO-0001',
    name: 'Sample Enquirer One',
    company: 'Demonstration Operator Ltd',
    email: 'enquirer.one@example.com',
    service: serviceIds['offshore-mooring-operations'],
    serviceLabel: 'Offshore Mooring Operations',
    projectLocation: 'Sample offshore terminal',
    description: 'SAMPLE ENQUIRY for demonstration. Request for inspection and possible replacement of SPM mooring lines.',
    status: 'new' as const,
  },
  {
    reference: 'NDEL-DEMO-0002',
    name: 'Sample Enquirer Two',
    company: 'Demonstration Ports Ltd',
    email: 'enquirer.two@example.com',
    service: serviceIds['marine-maintenance-and-salvage'],
    serviceLabel: 'Marine Maintenance and Salvage',
    projectLocation: 'Sample port approach',
    description: 'SAMPLE ENQUIRY for demonstration. Survey and removal of a small sunken vessel near a berth.',
    status: 'reviewing' as const,
    assignedTo: editor.id,
    internalNotes: [{ note: 'Sample note: requested site photographs from the enquirer.', author: admin.id, addedAt: new Date().toISOString() }],
  },
  {
    reference: 'NDEL-DEMO-0003',
    name: 'Sample Enquirer Three',
    company: 'Demonstration Energy Ltd',
    email: 'enquirer.three@example.com',
    service: serviceIds['asset-integrity-management'],
    serviceLabel: 'Asset Integrity Management',
    projectLocation: 'Sample shallow-water field',
    description: 'SAMPLE ENQUIRY for demonstration. NDT inspection of jacket members ahead of a maintenance campaign.',
    status: 'contacted' as const,
    assignedTo: admin.id,
  },
]
for (const e of sampleEnquiries) {
  await payload.create({ collection: 'enquiries', data: { ...e, emailNotification: 'not-configured' } })
}
log(`${sampleEnquiries.length} sample enquiries (one assigned to the editor)`)

log('done')
process.exit(0)
