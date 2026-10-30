/**
 * Seed content.
 *
 * - Services, company and contact details are drawn from statements on the
 *   previous website (ndsubsea.ng) and are marked "pending" NDEL verification.
 *   Unevidenced claims on that site (ISO certification, IMCA compliance, patents,
 *   experience figures) are deliberately NOT used; they are listed in
 *   `claimsAwaitingEvidence` instead.
 * - Projects and articles are fictional and marked "demonstration".
 */

const process = (...steps: [string, string][]) => steps.map(([title, description]) => ({ title, description }))
const items = (...list: string[]) => list.map((item) => ({ item }))

const verifyServiceNote =
  'Drawn from the previous website. NDEL to confirm scope, applications and process wording, and supply evidence for any capability statements.'

export const services = [
  {
    title: 'Offshore Mooring Operations',
    slug: 'offshore-mooring-operations',
    order: 1,
    summary:
      'Positioning and securing floating vessels and platforms using single point (SPM), spread and catenary mooring systems.',
    overview:
      'Floating facilities and vessels must hold station safely through changing weather and sea states. This service covers the engineering, supply and offshore installation work needed to design, install, inspect and maintain mooring systems.',
    problems: items(
      'Floating assets that need to hold position safely throughout their operating life.',
      'Mooring components approaching the end of their service life or showing wear.',
      'Lead times and logistics for anchors, buoys and mooring components.',
    ),
    scope: items(
      'Mooring engineering analysis.',
      'Anchor and buoy fabrication to project requirements.',
      'Procurement of mooring components.',
      'Offshore installation, hook-up and recovery of mooring systems.',
    ),
    applications: items(
      'Single point mooring (SPM) buoys at offshore terminals.',
      'Spread moorings for vessels and floating facilities.',
      'Catenary mooring systems.',
    ),
    process: process(
      ['Site and metocean review', 'Collect water depth, seabed and environmental data for the location.'],
      ['Mooring analysis', 'Analyse loads and select line, anchor and buoy configuration.'],
      ['Fabrication and procurement', 'Fabricate or source anchors, buoys and components.'],
      ['Offshore installation', 'Install, tension and verify the system under an approved method statement.'],
      ['Records and handover', 'Provide as-installed records and inspection data.'],
    ),
  },
  {
    title: 'Commercial Diving and ROV Services',
    slug: 'commercial-diving-and-rov-services',
    order: 2,
    summary:
      'Underwater support for exploration and production, including inspection, repair and maintenance (IRM) programmes and subsea inspections.',
    overview:
      'Subsea infrastructure needs regular inspection and intervention that can only be carried out by divers or remotely operated vehicles. This service provides diving and ROV support for inspection, repair and maintenance work.',
    problems: items(
      'Subsea assets that require inspection, repair or maintenance.',
      'Defects that need to be located and assessed underwater.',
      'Underwater tasks at depths or durations where an ROV is the safer option.',
    ),
    scope: items(
      'Inspection, repair and maintenance (IRM) programmes.',
      'Subsea inspections by diver or ROV.',
      'Underwater support to exploration and production operations.',
      'Installation and cleaning support for subsea equipment, including tidal turbines.',
    ),
    applications: items(
      'Pipelines, flowlines and risers.',
      'Jackets, platforms and subsea structures.',
      'Terminals, jetties and port infrastructure.',
    ),
    process: process(
      ['Task definition', 'Agree the inspection or intervention scope and acceptance criteria.'],
      ['Method selection', 'Select diver, ROV or combined spread for depth, duration and risk.'],
      ['Dive or ROV plan', 'Prepare the dive plan, risk assessment and emergency arrangements.'],
      ['Execution', 'Carry out the work with continuous recording.'],
      ['Reporting', 'Deliver inspection findings, footage and recommendations.'],
    ),
  },
  {
    title: 'Asset Integrity Management',
    slug: 'asset-integrity-management',
    order: 3,
    summary:
      'Inspection, maintenance, repair and installation work that keeps coastal and offshore infrastructure safe and in service for longer.',
    overview:
      'Ageing and corroding infrastructure creates safety, environmental and production risk. This service brings inspection, non-destructive testing and repair together so that integrity risks are identified and dealt with.',
    problems: items(
      'Corrosion and degradation of offshore and coastal structures.',
      'Uncertainty about the condition of ageing assets.',
      'Repairs needed to keep port and marine infrastructure in service.',
    ),
    scope: items(
      'Non-destructive testing (NDT).',
      'Port and coastal infrastructure repairs.',
      'Subsea cable and flowline installation.',
    ),
    applications: items('Offshore platforms and jackets.', 'Port, jetty and quay structures.', 'Subsea cables and flowlines.'),
    process: process(
      ['Baseline review', 'Review existing records and previous inspection results.'],
      ['Inspection and NDT', 'Inspect and test to establish current condition.'],
      ['Assessment', 'Assess findings and prioritise repairs by risk.'],
      ['Repair or installation', 'Carry out repairs or installation work.'],
      ['Integrity records', 'Update condition records for the next inspection cycle.'],
    ),
  },
  {
    title: 'Offshore Wind Farm Support',
    slug: 'offshore-wind-farm-support',
    order: 4,
    summary: 'Lifecycle support for commercial wind farms, from installation through to operation and maintenance.',
    overview:
      'Offshore wind assets require specialist access and inspection throughout installation and operation. This service provides drone, rope access, installation and maintenance support.',
    problems: items(
      'Safe access to turbines and structures for inspection and maintenance.',
      'Installation support for turbine components.',
      'Ongoing maintenance through the operating life of the asset.',
    ),
    scope: items('Drone inspection support.', 'Rope access.', 'Turbine installation support.', 'Maintenance support.'),
    applications: items('Offshore wind turbines and foundations.', 'Associated subsea and marine infrastructure.'),
    process: process(
      ['Access planning', 'Plan access method, weather windows and logistics.'],
      ['Inspection', 'Inspect by drone or rope access.'],
      ['Work execution', 'Carry out installation or maintenance tasks.'],
      ['Reporting', 'Report condition and work completed.'],
    ),
  },
  {
    title: 'Marine Maintenance and Salvage',
    slug: 'marine-maintenance-and-salvage',
    order: 5,
    summary:
      'Vessel inspection, hull and propeller surveys, wreck removal and re-floating, with attention to pollution prevention.',
    overview:
      'Vessels need regular underwater inspection, and wrecks or grounded vessels can obstruct navigation and threaten the environment. This service covers inspection, salvage and wreck removal with pollution prevention in mind.',
    problems: items(
      'Vessels needing hull and propeller condition checks.',
      'Wrecks or sunken vessels obstructing waterways or berths.',
      'Pollution risk from damaged or sunken vessels.',
    ),
    scope: items(
      'Vessel inspection.',
      'Hull and propeller surveys.',
      'Wreck removal and re-floating.',
      'Pollution prevention operations.',
    ),
    applications: items('Commercial and support vessels.', 'Ports, channels and berths.', 'Coastal and inland waterways.'),
    process: process(
      ['Survey', 'Survey the vessel or wreck and its surroundings.'],
      ['Salvage or repair plan', 'Prepare the method, including pollution controls.'],
      ['Execution', 'Carry out inspection, re-floating or removal.'],
      ['Close-out', 'Report the work and the condition of the site.'],
    ),
  },
  {
    title: 'Turnkey EPCIC Services',
    slug: 'turnkey-epcic-services',
    order: 6,
    summary:
      'Engineering, procurement, construction, installation and commissioning managed as one project, from concept to commissioning.',
    overview:
      'Clients with limited internal resources may need a single contractor to manage a project from concept to commissioning. This service brings engineering, procurement, construction, installation and commissioning under one project management structure.',
    problems: items(
      'Projects with many interfaces between engineering, procurement and installation contractors.',
      'Limited in-house resources to manage a project end to end.',
    ),
    scope: items(
      'Project management from concept to commissioning.',
      'Engineering, procurement, construction, installation and commissioning.',
      'Integrated industrial software services.',
      'Technical training.',
    ),
    applications: items('Marine and offshore facility projects.', 'Coastal infrastructure projects.'),
    process: process(
      ['Concept', 'Define requirements, options and the project plan.'],
      ['Engineering and procurement', 'Detailed engineering and procurement of equipment.'],
      ['Construction and installation', 'Fabricate, construct and install.'],
      ['Commissioning', 'Test, commission and hand over with documentation and training.'],
    ),
  },
].map((s) => ({ ...s, published: true, contentSource: 'pending' as const, verificationNote: verifyServiceNote }))

const demoNote = 'Fictional demonstration case study. Replace with an NDEL-approved project or delete before launch.'

export const projects = [
  {
    title: 'Sample: SPM buoy mooring line replacement',
    slug: 'sample-spm-mooring-line-replacement',
    services: ['offshore-mooring-operations', 'commercial-diving-and-rov-services'],
    projectStatus: 'completed' as const,
    location: 'Offshore terminal (sample)',
    period: 'Sample period',
    featured: true,
    summary: 'Illustrative example of a planned replacement of worn mooring lines on a single point mooring buoy.',
    challenge:
      'Routine inspection of a terminal SPM identified wear on several mooring chain segments. The terminal needed the lines replaced while keeping disruption to tanker operations as short as possible.',
    scope:
      'Engineering review of the existing mooring configuration, procurement of replacement chain and fittings, removal of worn segments and installation of new lines.',
    approach:
      'Work was planned around a weather window, with each leg replaced in sequence so that the buoy remained held throughout. Divers and an ROV verified each connection before re-tensioning.',
    outcome:
      'In a real case study this section would describe the verified result, for example how the work was completed and handed over, using only outcomes the client can evidence.',
  },
  {
    title: 'Sample: Jacket inspection and cathodic protection survey',
    slug: 'sample-jacket-inspection-cp-survey',
    services: ['asset-integrity-management', 'commercial-diving-and-rov-services'],
    projectStatus: 'completed' as const,
    location: 'Shallow-water field (sample)',
    period: 'Sample period',
    featured: true,
    summary: 'Illustrative example of a general visual inspection and CP survey of an ageing platform jacket.',
    challenge: 'The operator needed current condition data on an ageing jacket to plan its maintenance programme.',
    scope: 'General visual inspection, close visual inspection of selected nodes, CP readings and wall-thickness measurements.',
    approach:
      'An inspection plan was agreed with the operator, prioritising members with known history. Findings were recorded against a common reference grid so that results could be compared with earlier surveys.',
    outcome:
      'In a real case study this section would summarise the findings delivered and how the client used them, without stating unverified performance figures.',
  },
  {
    title: 'Sample: Wreck removal from a port approach',
    slug: 'sample-wreck-removal-port-approach',
    services: ['marine-maintenance-and-salvage'],
    projectStatus: 'completed' as const,
    location: 'Port approach channel (sample)',
    period: 'Sample period',
    featured: true,
    summary: 'Illustrative example of removing a sunken vessel that obstructed a navigation channel.',
    challenge: 'A sunken workboat in an approach channel restricted navigation and posed a pollution risk.',
    scope: 'Survey of the wreck, removal of residual fuel, re-floating and removal of the hull.',
    approach:
      'Residual hydrocarbons were removed before lifting operations began, with containment equipment deployed. The vessel was re-floated and towed to an agreed disposal site.',
    outcome:
      'In a real case study this section would state the verified outcome, for example confirmation that the channel was cleared.',
  },
  {
    title: 'Sample: Turbine foundation inspection programme',
    slug: 'sample-turbine-foundation-inspection',
    services: ['offshore-wind-farm-support', 'asset-integrity-management'],
    projectStatus: 'in-progress' as const,
    location: 'Offshore wind site (sample)',
    period: 'Sample period',
    featured: false,
    summary: 'Illustrative example of a recurring inspection programme for wind turbine foundations.',
    challenge: 'The asset owner required a repeatable inspection programme across multiple turbine foundations.',
    scope: 'Drone inspection of above-water structures, rope access for close inspection and subsea inspection of scour protection.',
    approach: 'A standard inspection template was used across all foundations so that results can be trended over time.',
    outcome: 'This sample project is shown as in progress. A real entry would be updated as verified results become available.',
  },
  {
    title: 'Sample: Jetty refurbishment, engineering to commissioning',
    slug: 'sample-jetty-refurbishment-epcic',
    services: ['turnkey-epcic-services', 'asset-integrity-management'],
    projectStatus: 'in-progress' as const,
    location: 'Coastal facility (sample)',
    period: 'Sample period',
    featured: false,
    summary: 'Illustrative example of an EPCIC package for refurbishing a loading jetty.',
    challenge: 'A loading jetty needed structural repairs and new equipment, with a single contractor accountable for delivery.',
    scope: 'Condition assessment, design of repairs, procurement, construction, installation and commissioning of new fenders and equipment.',
    approach: 'Work was phased so that part of the jetty could remain in use during refurbishment.',
    outcome: 'This sample project is shown as in progress. A real entry would describe verified completion details.',
  },
].map((p) => ({ ...p, published: true, contentSource: 'demonstration' as const, verificationNote: demoNote }))

export const team = [
  {
    name: 'Augustine',
    position: 'Managing Director',
    order: 1,
    verificationNote:
      'Previous website labels "Augustine" as MD, but the MD message is signed "Isodje A". Confirm full name, title and biography.',
  },
  {
    name: 'Anthony',
    position: 'Role to be confirmed',
    order: 2,
    verificationNote: 'Shown on the previous website without a title. Confirm full name, title and biography.',
  },
  {
    name: 'Anastasia',
    position: 'Coordinator',
    order: 3,
    verificationNote: 'Confirm full name, title and biography.',
  },
].map((m) => ({ ...m, published: true, contentSource: 'pending' as const }))

export const claimsAwaitingEvidence = [
  { claim: 'ISO certification', evidenceRequired: 'Certificate copy: standard, issuing body, certificate number, expiry.' },
  { claim: 'IMCA-compliant commercial diving', evidenceRequired: 'IMCA membership or audit evidence and scope.' },
  {
    claim: 'Nationally patented mooring buoy system ("first of its kind")',
    evidenceRequired: 'Patent number, title, holder and issuing office.',
  },
  { claim: 'HSE framework that "exceeds industry requirements"', evidenceRequired: 'HSE policy and supporting audit evidence.' },
  { claim: 'Afam Industrial Hub', evidenceRequired: 'What the facility is and NDEL’s relationship to it.' },
  { claim: 'Years of experience, offices and workforce figures', evidenceRequired: 'Actual figures (the previous site shows 0).' },
  {
    claim: 'Registered company name',
    evidenceRequired: 'Previous site shows both "Nedportal-Diko Engineering Ltd" and "Netportal Diko Engineering Limited". Confirm against CAC records.',
  },
]

export const safetySections = [
  {
    heading: 'Health, safety and environment policy',
    body: 'This section will summarise NDEL’s HSE policy statement, who it applies to and how it is communicated, using the wording of NDEL’s signed policy.',
  },
  {
    heading: 'Quality management',
    body: 'This section will describe NDEL’s quality management arrangements. Any certification will be stated with its standard, issuing body and certificate number, and the certificate made available for download.',
  },
  {
    heading: 'Diving and ROV operations',
    body: 'This section will state the standards and codes of practice NDEL follows for diving and ROV operations, as confirmed by NDEL’s procedures and any membership or audit records.',
  },
  {
    heading: 'Environmental protection',
    body: 'This section will cover how pollution prevention and environmental controls are built into offshore, salvage and port work, based on NDEL’s documented procedures.',
  },
  {
    heading: 'Competence and training',
    body: 'This section will describe how NDEL ensures personnel are trained and certified for their roles, based on NDEL’s competence management records.',
  },
  {
    heading: 'Incident reporting and learning',
    body: 'This section will explain how incidents and near misses are reported and reviewed. Safety statistics will only be published if NDEL supplies verified figures.',
  },
].map((s) => ({ ...s, status: 'awaiting' as const }))
