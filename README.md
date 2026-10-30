# NDEL website: proposal demonstration

Corporate website and enquiry-management demonstration for **NDEL**, a Nigerian subsea, marine and offshore engineering business. Prepared by Metachain Software as a private proposal demonstration and as the foundation for a production build.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion for React · Payload CMS 3 · PostgreSQL · optional S3-compatible storage.

---

## Contents

1. [Quick start](#quick-start)
2. [What is included](#what-is-included)
3. [Content status and sample content](#content-status-and-sample-content)
4. [Enquiry workflow](#enquiry-workflow)
5. [Staff roles and permissions](#staff-roles-and-permissions)
6. [Environment variables](#environment-variables)
7. [Integration status](#integration-status)
8. [Deploying to production](#deploying-to-production)
9. [Verification](#verification)
10. [Content NDEL must verify before launch](#content-ndel-must-verify-before-launch)
11. [Known limitations](#known-limitations)

---

## Quick start

Requirements: Node.js 20.9 or later (developed on Node 24). No PostgreSQL installation is needed for local development.

```bash
npm install
cp .env.example .env          # then fill in the values (see below)

# Terminal 1: local PostgreSQL on port 5433, data kept in .local/pgdata
npm run db:start

# Terminal 2
npm run seed                  # staff accounts + sample content (safe to re-run)
npm run dev                   # http://localhost:3000
```

* **Website:** http://localhost:3000. You will be asked for `DEMO_ACCESS_PASSWORD`.
* **Staff area:** http://localhost:3000/admin. Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` or the editor account.

`npm run db:start` uses the [`embedded-postgres`](https://www.npmjs.com/package/embedded-postgres) package, which runs a real PostgreSQL 17 server from `node_modules`. To use your own PostgreSQL instead, point `DATABASE_URL` at it and skip that step.

| Command | Purpose |
| --- | --- |
| `npm run db:start` | Local PostgreSQL for development |
| `npm run dev` | Development server (Payload pushes schema changes automatically) |
| `npm run seed` | Create or refresh staff accounts, sample content and sample enquiries |
| `npm run build` / `npm start` | Production build and server |
| `npm run migrate` | Apply database migrations (production) |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `npm run generate:importmap` | Regenerate the admin import map after adding admin components |
| `npm run lint` | TypeScript check |
| `npm run verify` | End-to-end verification against a running server (see [Verification](#verification)) |

---

## What is included

### Public pages

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | Explanation, "Discuss Your Project" and "Explore Our Services" actions, services, delivery process, selected case studies, safety and quality, company profile download (appears only when a published PDF is set), enquiry section |
| About | `/about` | Overview, operating approach, leadership profiles, credentials (only published, verified documents) |
| Services | `/services`, `/services/[slug]` | Scope, problems addressed, applications, delivery process, related projects and insights. Every enquiry link preselects the service. |
| Projects | `/projects`, `/projects/[slug]` | Filter by service and status (shareable URL), challenge / scope / approach / outcome, image gallery, optional video (never autoplays) |
| Safety and Quality | `/safety-quality` | Structured policy areas, each marked "Awaiting document" until NDEL supplies it; downloadable PDFs |
| Insights | `/insights`, `/insights/[slug]` | Rich-text articles with author, publication date and related services |
| Contact | `/contact` | Contact details, enquiry form; map shown only when the location is marked verified |

Also: `sitemap.xml`, `robots.txt`, per-page metadata and canonical URLs, a 404 page and a demo-access page.

### Staff area (`/admin`, Payload CMS)

Manage services, projects, team profiles, articles, company documents, images, company profile, contact information, safety and quality content, staff users and enquiries. The dashboard opens with enquiry counts by status, each linking to a filtered list.

### Design

Deep navy, restrained teal, off-white paper backgrounds and small safety-orange accents. Archivo headings, IBM Plex Sans body text, IBM Plex Mono labels. Fonts are self-hosted at build time by `next/font`.

**Imagery:** no stock photography is used. Every image slot shows a clearly captioned schematic placeholder ("Image placeholder: … Photography to be supplied") until NDEL-owned or licensed photography is uploaded. The **Images** collection records each image's licence status.

**Motion:** section entrances use CSS scroll-driven animation, so there is no JavaScript and content is never hidden if animation is unsupported. Project filtering and form state changes use Motion for React. All motion is disabled under `prefers-reduced-motion`. There is no scroll hijacking, loading screen or autoplay.

---

## Content status and sample content

Every public content item has a **Content status** field:

| Status | Meaning | Demo site | Live site |
| --- | --- | --- | --- |
| **Verified** | Approved by NDEL for publication | Shown | Shown |
| **Pending** | From the previous website, awaiting NDEL verification | Shown with a "Pending NDEL verification" label | **Hidden** |
| **Demonstration** | Fictional sample showing the intended format | Shown with a "Demonstration sample" label and notice | **Hidden** |

`SITE_MODE` controls this:

* `SITE_MODE=demo` (default): password-protected, `noindex`, shows a proposal banner, and shows labelled pending and demonstration content.
* `SITE_MODE=live`: public, indexable, and shows **only verified content**. The rule is enforced in collection access control, so it also applies to the REST API and the sitemap.

Contact details (address, phone numbers, emails) have their own **Verified** tick box. Unconfirmed details carry a note on the demo site and are omitted on the live site. Each item also has an internal **Verification note** that is never shown publicly.

**Seeded content:**

* **6 services:** written from the service areas described on ndsubsea.ng, marked *Pending*.
* **5 projects and 2 articles:** fictional, marked *Demonstration*, with "Sample:" in project titles.
* **3 team profiles:** first names and titles shown on the previous website, marked *Pending*, with the inconsistencies recorded in their verification notes.
* **Safety and Quality:** six policy areas that describe what each section *will* contain. They make no claims.
* **3 sample enquiries:** references `NDEL-DEMO-0001` to `0003`, one assigned to the editor so that permissions can be demonstrated.

---

## Enquiry workflow

Service or project page → `/contact?service=…[&project=…]` → server action → database record → reference shown on screen → staff dashboard.

* **Fields:** name, company, work email, telephone (optional), service required, project location, project description, anticipated start date (optional), supporting document (optional), and a consent acknowledgement.
* **Server-side validation** (`src/lib/enquiry.ts`): every field is validated with Zod. The service must be one currently published, or "Other". Errors return to the form with an error summary that receives focus, inline messages, `aria-invalid`, and the visitor's input preserved.
* **Attachments:** PDF, DOCX, XLSX, JPG or PNG, up to 10 MB, checked in four ways:
  1. The extension is checked against an allow-list.
  2. The file's leading bytes ("magic bytes") must match its extension.
  3. The size is checked in the browser for early feedback, and again on the server.
  4. Payload's own MIME detection and PDF structure check run on upload.

  Stored files are renamed to the enquiry reference.
* **Privacy:** attachments are stored in `private-uploads/enquiries/`, outside the public folder. They are served only through Payload's file route, which applies the collection's access rules. Anonymous requests receive 403. Enquiries and attachments cannot be created, listed or read through the public REST API. Enquiries are created only by the server action, and GraphQL is disabled.
* **Reference:** `NDEL-YYMMDD-XXXXX`, using random characters without look-alikes (no 0/O, 1/I). It has a unique database index, and the save is retried if a collision occurs.
* **Atomic save:** the attachment, the enquiry and the link between them are written in one database transaction. Success is shown **only after the transaction commits**. If the save fails, the transaction is rolled back and any stored file is deleted.
* **Email:** if SMTP is not configured, the confirmation says the enquiry was saved and that **no email has been sent**. When SMTP is configured, staff receive a notification without contact details or attachments, and the result (`sent` or `failed`) is recorded on the enquiry. A failed email never turns a saved enquiry into an error.
* **Abuse controls:** a honeypot field and a limit of 5 valid submissions per IP address per 10 minutes. Correcting validation errors does not count towards the limit.

---

## Staff roles and permissions

| Capability | Administrator | Editor |
| --- | --- | --- |
| Website content (services, projects, team, articles, documents, images, company, contact, safety and quality) | ✔ | ✔ |
| View and update enquiries | All | **Only enquiries assigned to them** |
| View enquiry attachments | All | Only for enquiries assigned to them |
| Assign enquiries to staff | ✔ | ✖ |
| Delete enquiries and attachments | ✔ | ✖ |
| Create staff accounts or change roles | ✔ | ✖ (cannot promote themselves) |

Enquiry handling covers:

* **Status:** New, Reviewing, Contacted or Closed.
* **Search** by reference, name, company, email and location.
* **Filters** on any field.
* **Assignment** to a staff member.
* **Submission timestamp.**
* **Internal notes.** Notes are append-only: each is stamped with the signed-in author and time, and saved notes cannot be edited or removed through the UI or the API.

Submitted fields are read-only in the admin. Staff sessions expire after 8 hours, and accounts lock for 15 minutes after 5 failed sign-ins.

---

## Environment variables

All variables are server-only. No `NEXT_PUBLIC_` variables are used. See `.env.example` for the annotated template.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Yes | Signs staff sessions and the demo-access cookie. Long random value. |
| `SITE_URL` | Yes | Public base URL, used for metadata, the sitemap and links |
| `SITE_MODE` | No | `demo` (default) or `live`. See above. |
| `DEMO_ACCESS_PASSWORD` | In demo mode | Password for the demonstration. In production demo mode, a blank value blocks all access rather than opening the site. |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_EDITOR_EMAIL`, `SEED_EDITOR_PASSWORD` | For `npm run seed` | Staff accounts created by the seed script |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME`, `ENQUIRY_NOTIFICATION_EMAIL` | No | Enquiry notification email. Enabled only when `SMTP_HOST`, `SMTP_FROM_ADDRESS` and `ENQUIRY_NOTIFICATION_EMAIL` are all set. |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | No | S3-compatible storage for images, documents and enquiry attachments. Enabled only when the bucket and both keys are set. |

---

## Integration status

Only items marked **Working** have been configured and tested.

| Integration | Status |
| --- | --- |
| PostgreSQL | **Working:** tested locally with PostgreSQL 17 (embedded) |
| Payload CMS admin | **Working:** tested |
| Local file storage (private attachments) | **Working:** tested, including access denial |
| Email notifications (SMTP) | **Not configured.** Code path implemented, not tested against a real mail server. |
| S3-compatible storage | **Not configured.** Uses the official `@payloadcms/storage-s3` plugin with Payload access control kept in front of files. Not tested against a bucket. |
| Analytics | **None installed** |
| Map | **Disabled** until NDEL verifies the office coordinates (an OpenStreetMap embed appears when *Location verified* is ticked) |
| Project video | YouTube (privacy-enhanced domain), Vimeo (do-not-track) or direct `.mp4` links. Rendering is implemented; no real video has been tested. |

---

## Deploying to production

1. Provision PostgreSQL and set `DATABASE_URL`, `PAYLOAD_SECRET` and `SITE_URL`.
2. For uploads on a serverless or multi-instance host, configure a **private** S3-compatible bucket (`S3_*`). Local disk storage is suitable only for a single server with persistent storage.
3. Run `npm ci`, `npm run build` and `npm run migrate`, then `npm start`. The initial migration is in `src/migrations/`. After changing collections, run `npm run payload migrate:create <name>`.
4. Create the first administrator by visiting `/admin`, or run `npm run seed` with the seed variables set. **The seed also inserts demonstration content**, so do not seed a live database unless you intend to replace that content.
5. While the proposal is under review, keep `SITE_MODE=demo` with a strong `DEMO_ACCESS_PASSWORD`. Switch to `SITE_MODE=live` only after NDEL has verified the content.
6. Configure SMTP and confirm that a real notification arrives before describing email as operational.

---

## Verification

`npm run verify` runs `scripts/verify.mjs`. It uses Playwright with headless Chromium for browser journeys and plain HTTP requests for API permission checks, then removes the test enquiries it created. Screenshots and `results.json` are written to `.local/verify/`.

**Last results (30 October 2026):**

* **90/90 checks passed** on the development server.
* The same suite was run against a production build (`next build` + `next start`). Every check passed except the final clean-up assertion: Payload returns HTTP 500 rather than 404 for a deleted file, which the script did not expect. The assertion has since been changed to "file no longer served" and passes on the development server.

The checks cover:

* **Demo gate:** redirects, wrong and correct passwords, API returns 401 without the cookie, `noindex` header and meta tag, `robots.txt`.
* **Pages:** all public pages render, the sitemap is generated, and sample and pending content is labelled.
* **Service preselection:** from service pages and from project pages; invalid `service` values are ignored.
* **Project filters:** service, status, combined, restored from the URL, `aria-pressed` and the announced result count.
* **Enquiry journey:**
  * Empty submission produces a focused error summary and `aria-invalid` fields.
  * Disguised, disallowed and oversized files are rejected (oversized both in the browser and on the server).
  * A valid submission returns a reference, moves focus to the confirmation, and makes an honest statement that no email was sent.
* **Privacy:** anonymous access to enquiries, attachments and users is denied via the API and the file URL.
* **Permissions:**
  * Admins can see and download everything.
  * An unassigned editor can't open the enquiry or its attachment; once assigned, they can.
  * Editors can't reassign, delete, create users or promote themselves.
  * Note authorship can't be forged, and saved notes can't be removed.
* **Search and filters:** enquiry search by company/reference and filter by status.
* **Admin UI:** sign-in, dashboard summary and the enquiry list.
* **Keyboard:** skip link, and a visible focus indicator on every tab stop of the enquiry form, including the date picker.
* **Mobile (375 px):** no horizontal overflow on any page; menu opens, closes with Escape (returning focus) and navigates.
* **Motion and resilience:** animations disabled and content visible under reduced motion; projects visible with JavaScript disabled; no browser console errors.

**Also checked manually:** `SITE_MODE=live` on the production build hides all pending and demonstration content (0 public services and projects), removes the banner and unconfirmed phone number, allows indexing, and still returns 403 for enquiries.

**Not yet verified:**

* Safari and Firefox.
* Real mobile devices.
* Screen readers (NVDA, VoiceOver).
* SMTP delivery.
* S3 storage.
* Load testing.

---

## Content NDEL must verify before launch

The previous website (ndsubsea.ng) contains claims that are **not used** on this site until evidence is supplied. They are tracked in the admin under **Company profile → Claims awaiting evidence**:

* ISO certification: certificate copy (standard, issuing body, number, expiry).
* "IMCA-compliant" commercial diving: membership or audit evidence.
* "Nationally patented" mooring buoy system: patent number, holder, office.
* HSE framework "exceeding industry requirements": policy and audit evidence.
* Afam Industrial Hub: what it is and NDEL's relationship to it.
* Years of experience, offices and workforce figures: the previous site shows 0 for each.
* **Registered name:** the previous site shows both "Nedportal-Diko Engineering Ltd" and "Netportal Diko Engineering Limited". The site displays "NDEL" until this is confirmed.

Also to confirm:

* **Leadership:** "Augustine" is labelled MD, but the MD message is signed "Isodje A". Full names, titles, biographies and portraits are needed.
* **Contact details:** address, phone and email.
* **Office hours:** the previous site's Sunday entry was incomplete and has been left out.
* **Office location:** coordinates for the map.
* **Service descriptions:** all six.
* **Real case studies:** with client permission and evidenced outcomes.
* **Documents:** company profile PDF and policy documents.
* **Photography:** owned or licensed images.

Template text, the zero-value counters, dead social links and the mismatched phone link on the previous site have **not** been copied.

---

## Known limitations

* **Rate limiting** is in memory, per server instance. Use a shared store (for example Redis) if the site runs on several instances.
* **Scroll-driven section entrances** currently animate only in Chromium-based browsers. Other browsers show the content statically, which is intentional.
* **`npm audit`** reports 17 issues in production dependencies (3 high, 5 moderate, 9 low), all transitive through Payload's packages. The high-severity items come from `happy-dom` via `@lexical/headless`, which this site does not use to process visitor input. The only automatic "fix" npm offers is a downgrade to an incompatible version, so the recommendation is to update Payload when a patched release is available. A critical DOMPurify advisory, pulled in through the admin's code editor, is patched by an `overrides` entry in `package.json`.
* **Missing files:** Payload returns HTTP 500 rather than 404 for a file that no longer exists. No data is exposed.
* **Out of scope by design:** payments, customer accounts, vessel tracking and portal features.
