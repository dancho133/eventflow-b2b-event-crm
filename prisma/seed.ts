import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding EVENTFLOW database...');

  // Clean existing data
  await prisma.aIInteraction.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  // 1. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'EventFlow Global HQ',
      slug: 'eventflow-hq',
      domain: 'eventflow.io',
    },
  });

  // 2. Create Users
  const userSarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@eventflow.io',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      workspaceId: workspace.id,
    },
  });

  const userMarcus = await prisma.user.create({
    data: {
      name: 'Marcus Chen',
      email: 'marcus.chen@eventflow.io',
      role: 'ORGANIZER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      workspaceId: workspace.id,
    },
  });

  const userElena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@eventflow.io',
      role: 'STAFF',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      workspaceId: workspace.id,
    },
  });

  // 3. Create Companies (20 Companies)
  const companyData = [
    { name: 'CloudScale Systems', domain: 'cloudscale.io', industry: 'Cloud Infrastructure', size: '500+', tier: 'Enterprise', headquarters: 'Austin, TX', website: 'https://cloudscale.io' },
    { name: 'FinTech Pulse', domain: 'fintechpulse.com', industry: 'Financial Services', size: '201-500', tier: 'Enterprise', headquarters: 'New York, NY', website: 'https://fintechpulse.com' },
    { name: 'NexGen Robotics', domain: 'nexgenrobotics.com', industry: 'Robotics & AI', size: '51-200', tier: 'Mid-Market', headquarters: 'Boston, MA', website: 'https://nexgenrobotics.com' },
    { name: 'CyberShield Global', domain: 'cybershield.security', industry: 'Cybersecurity', size: '500+', tier: 'Enterprise', headquarters: 'San Jose, CA', website: 'https://cybershield.security' },
    { name: 'HealthSpan Analytics', domain: 'healthspan.ai', industry: 'HealthTech', size: '51-200', tier: 'Mid-Market', headquarters: 'Chicago, IL', website: 'https://healthspan.ai' },
    { name: 'Aura Design Works', domain: 'auradesign.co', industry: 'Design & UX', size: '11-50', tier: 'SMB', headquarters: 'San Francisco, CA', website: 'https://auradesign.co' },
    { name: 'OmniCommerce Labs', domain: 'omnicommerce.net', industry: 'E-Commerce & Retail', size: '201-500', tier: 'Mid-Market', headquarters: 'Seattle, WA', website: 'https://omnicommerce.net' },
    { name: 'Apex Biopharma', domain: 'apexbiopharma.org', industry: 'Biotechnology', size: '500+', tier: 'Enterprise', headquarters: 'San Diego, CA', website: 'https://apexbiopharma.org' },
    { name: 'Hyperion Energy', domain: 'hyperionenergy.com', industry: 'CleanTech', size: '201-500', tier: 'Enterprise', headquarters: 'Denver, CO', website: 'https://hyperionenergy.com' },
    { name: 'Quantum Leap Software', domain: 'quantumleap.dev', industry: 'Quantum Computing', size: '51-200', tier: 'Mid-Market', headquarters: 'Cambridge, MA', website: 'https://quantumleap.dev' },
    { name: 'Starlight Logistics', domain: 'starlightlogistics.com', industry: 'Supply Chain', size: '201-500', tier: 'Mid-Market', headquarters: 'Atlanta, GA', website: 'https://starlightlogistics.com' },
    { name: 'Vanguard Media Group', domain: 'vanguardmedia.com', industry: 'Digital Media', size: '11-50', tier: 'SMB', headquarters: 'Los Angeles, CA', website: 'https://vanguardmedia.com' },
    { name: 'BlueWave Networks', domain: 'bluewavenetworks.io', industry: 'Telecommunications', size: '201-500', tier: 'Mid-Market', headquarters: 'Miami, FL', website: 'https://bluewavenetworks.io' },
    { name: 'Synthetix AI', domain: 'synthetix.ai', industry: 'Generative AI', size: '11-50', tier: 'Startup', headquarters: 'San Francisco, CA', website: 'https://synthetix.ai' },
    { name: 'GreenCore Materials', domain: 'greencore.earth', industry: 'Sustainability & ESG', size: '11-50', tier: 'SMB', headquarters: 'Portland, OR', website: 'https://greencore.earth' },
    { name: 'Argus Security Systems', domain: 'argussec.com', industry: 'Enterprise Security', size: '51-200', tier: 'Mid-Market', headquarters: 'Washington, DC', website: 'https://argussec.com' },
    { name: 'Kore Payments', domain: 'korepayments.com', industry: 'FinTech & Payments', size: '51-200', tier: 'Mid-Market', headquarters: 'Charlotte, NC', website: 'https://korepayments.com' },
    { name: 'DataForge Labs', domain: 'dataforgelabs.io', industry: 'Data Engineering', size: '1-10', tier: 'Startup', headquarters: 'Toronto, Canada', website: 'https://dataforgelabs.io' },
    { name: 'Peak Horizon Ventures', domain: 'peakhorizon.vc', industry: 'Venture Capital', size: '11-50', tier: 'SMB', headquarters: 'Menlo Park, CA', website: 'https://peakhorizon.vc' },
    { name: 'Nova BioTech', domain: 'novabiotech.io', industry: 'Life Sciences', size: '1-10', tier: 'Startup', headquarters: 'Philadelphia, PA', website: 'https://novabiotech.io' },
  ];

  const companies: any[] = [];
  for (const c of companyData) {
    const created = await prisma.company.create({
      data: {
        ...c,
        workspaceId: workspace.id,
      },
    });
    companies.push(created);
  }

  // 4. Create 6 B2B Events
  const eventsData = [
    {
      title: 'Business Innovation Forum 2026',
      slug: 'business-innovation-forum-2026',
      description: 'The premier annual gathering for corporate innovators, enterprise transformation leaders, and pioneering technology architects shaping the next decade of enterprise operations.',
      shortDescription: 'Enterprise transformation, disruptive technologies, and strategic B2B leadership.',
      eventType: 'Conference',
      status: 'Published',
      startDate: new Date('2026-05-14T09:00:00Z'),
      endDate: new Date('2026-05-16T17:30:00Z'),
      timezone: 'America/Los_Angeles',
      location: 'San Francisco, CA',
      venueAddress: 'Moscone Convention Center, 747 Howard St, San Francisco, CA 94103',
      virtualUrl: 'https://live.eventflow.io/bif-2026',
      capacity: 350,
      tags: JSON.stringify(['Enterprise', 'Innovation', 'AI Strategy', 'Leadership', 'B2B Sales']),
      budget: 125000,
      expectedRevenue: 350000,
      workspaceId: workspace.id,
      createdById: userSarah.id,
    },
    {
      title: 'Global SaaS Summit 2026',
      slug: 'global-saas-summit-2026',
      description: 'The global benchmark summit uniting 500+ SaaS founders, revenue executives, and cloud infrastructure specialists on hyperscaling enterprise software recurring revenue.',
      shortDescription: 'Scaling ARR, PLG mechanics, and multi-tier enterprise go-to-market strategies.',
      eventType: 'Summit',
      status: 'Published',
      startDate: new Date('2026-06-22T08:30:00Z'),
      endDate: new Date('2026-06-24T18:00:00Z'),
      timezone: 'America/New_York',
      location: 'New York, NY',
      venueAddress: 'Javits Center, 429 11th Ave, New York, NY 10001',
      virtualUrl: 'https://live.eventflow.io/saas-summit-2026',
      capacity: 500,
      tags: JSON.stringify(['SaaS', 'Revenue Ops', 'Cloud', 'GTM', 'Venture Capital']),
      budget: 180000,
      expectedRevenue: 480000,
      workspaceId: workspace.id,
      createdById: userMarcus.id,
    },
    {
      title: 'Enterprise AI & Machine Learning Workshop',
      slug: 'enterprise-ai-ml-workshop-2026',
      description: 'Hands-on technical workshop for enterprise architects and engineering leaders deploying autonomous agents, LLM pipelines, and secure internal AI guardrails.',
      shortDescription: 'Production AI architecture, agentic orchestration, and LLM compliance.',
      eventType: 'Workshop',
      status: 'Published',
      startDate: new Date('2026-04-10T13:00:00Z'),
      endDate: new Date('2026-04-10T18:00:00Z'),
      timezone: 'America/New_York',
      location: 'Virtual Event',
      virtualUrl: 'https://stream.eventflow.io/workshops/ai-ml-2026',
      capacity: 200,
      tags: JSON.stringify(['AI/ML', 'LLM', 'Hands-on', 'Engineering', 'Architecture']),
      budget: 15000,
      expectedRevenue: 50000,
      workspaceId: workspace.id,
      createdById: userSarah.id,
    },
    {
      title: 'Cybersecurity Resilience Roundtable',
      slug: 'cybersecurity-resilience-roundtable-2026',
      description: 'Exclusive, Chatham-House rule executive roundtable addressing nation-state threat vectors, zero-trust infrastructure, and post-quantum cryptographic readiness.',
      shortDescription: 'Zero-trust architecture, threat defense, and executive cyber governance.',
      eventType: 'Conference',
      status: 'Completed',
      startDate: new Date('2026-01-18T10:00:00Z'),
      endDate: new Date('2026-01-18T16:00:00Z'),
      timezone: 'America/Chicago',
      location: 'Chicago, IL',
      venueAddress: 'The Peninsula Chicago, 108 E Superior St, Chicago, IL 60611',
      capacity: 80,
      tags: JSON.stringify(['Cybersecurity', 'CISO', 'Zero Trust', 'Governance']),
      budget: 35000,
      expectedRevenue: 75000,
      workspaceId: workspace.id,
      createdById: userMarcus.id,
    },
    {
      title: 'B2B Marketing & Growth Masterclass',
      slug: 'b2b-marketing-growth-masterclass-2026',
      description: 'Intensive digital masterclass examining high-intent pipeline generation, automated ABM frameworks, and attribution modeling across multi-touch customer journeys.',
      shortDescription: 'ABM frameworks, intent data, and multi-channel attribution strategies.',
      eventType: 'Webinar',
      status: 'Completed',
      startDate: new Date('2026-02-24T14:00:00Z'),
      endDate: new Date('2026-02-24T17:00:00Z'),
      timezone: 'America/New_York',
      location: 'Virtual Broadcast',
      virtualUrl: 'https://stream.eventflow.io/masterclass/b2b-growth',
      capacity: 150,
      tags: JSON.stringify(['Marketing', 'ABM', 'Growth', 'Demand Gen']),
      budget: 12000,
      expectedRevenue: 38000,
      workspaceId: workspace.id,
      createdById: userElena.id,
    },
    {
      title: 'Executive Leadership Retreat Fall 2026',
      slug: 'executive-leadership-retreat-fall-2026',
      description: 'Invitational boutique retreat for Fortune 500 C-Suite leaders exploring global macroeconomic trends, AI ethics, and sustainable corporate resilience.',
      shortDescription: 'Intimate C-Suite strategy retreat in Northern California wine country.',
      eventType: 'Networking',
      status: 'Draft',
      startDate: new Date('2026-09-18T15:00:00Z'),
      endDate: new Date('2026-09-20T14:00:00Z'),
      timezone: 'America/Los_Angeles',
      location: 'Napa Valley, CA',
      venueAddress: 'Meadowood Napa Valley, 900 Meadowood Ln, St Helena, CA 94574',
      capacity: 40,
      tags: JSON.stringify(['Executive', 'Networking', 'C-Suite', 'Strategy']),
      budget: 95000,
      expectedRevenue: 160000,
      workspaceId: workspace.id,
      createdById: userSarah.id,
    },
  ];

  const events: any[] = [];
  for (const e of eventsData) {
    const created = await prisma.event.create({
      data: e,
    });
    events.push(created);
  }

  // 5. Create 75 Realistic Contacts
  const firstNames = [
    'David', 'Jessica', 'Michael', 'Samantha', 'Robert', 'Emily', 'James', 'Ashley', 'William', 'Amanda',
    'Alexander', 'Sarah', 'Daniel', 'Olivia', 'Matthew', 'Sophia', 'Christopher', 'Isabella', 'Andrew', 'Mia',
    'Joshua', 'Charlotte', 'Joseph', 'Amelia', 'Kevin', 'Harper', 'Brian', 'Evelyn', 'George', 'Abigail',
    'Edward', 'Emily', 'Ronald', 'Elizabeth', 'Timothy', 'Mila', 'Jason', 'Ella', 'Jeffrey', 'Avery',
    'Ryan', 'Sofia', 'Jacob', 'Camila', 'Gary', 'Aria', 'Nicholas', 'Scarlett', 'Eric', 'Victoria',
    'Jonathan', 'Madison', 'Stephen', 'Luna', 'Larry', 'Grace', 'Justin', 'Chloe', 'Scott', 'Penelope',
    'Brandon', 'Layla', 'Benjamin', 'Riley', 'Samuel', 'Zoey', 'Gregory', 'Nora', 'Frank', 'Lily',
    'Raymond', 'Eleanor', 'Patrick', 'Hannah', 'Jack'
  ];

  const lastNames = [
    'Vance', 'Sterling', 'Thornton', 'Blackwood', 'Sinclair', 'Montgomery', 'Kowalski', 'Kaufman', 'Hawthorne', 'Mercer',
    'Gallagher', 'Novak', 'Chambers', 'Prescott', 'Winters', 'Delgado', 'Kensington', 'Holloway', 'Sutherland', 'Winslow',
    'Fontaine', 'Castillo', 'Langley', 'Redfield', 'Whitmore', 'Caldwell', 'Donovan', 'Fairchild', 'Bellingham', 'Carlisle',
    'Vanderbilt', 'Ellington', 'MacIntyre', 'Davenport', 'Lockwood', 'Ashford', 'Cross', 'Barrington', 'Carrington', 'Sinclair',
    'Kincaid', 'Thorne', 'Valerius', 'Beaumont', 'Sterling', 'Patterson', 'Morrison', 'Reynolds', 'Harrison', 'Sherwood',
    'Beckett', 'Harrington', 'Stanton', 'Bradford', 'Summers', 'Mercer', 'Waverly', 'Kingsley', 'Sterling', 'Prescott',
    'Vanguard', 'Aldridge', 'Castleton', 'Fairfax', 'Radcliffe', 'Stanhope', 'Livingston', 'Westbrook', 'Pembroke', 'Stratford',
    'Huntington', 'Collier', 'Ellsworth', 'Holt', 'Bishop'
  ];

  const titles = [
    'Chief Technology Officer', 'VP of Engineering', 'Director of Enterprise Architecture', 'Chief Revenue Officer',
    'Head of Product Strategy', 'Director of Cloud Operations', 'VP of Strategic Partnerships', 'Chief Information Security Officer',
    'Principal AI Scientist', 'VP of Global Marketing', 'Senior Solutions Architect', 'Director of Procurement',
    'Head of Demand Generation', 'VP of Business Development', 'Chief Digital Officer', 'Director of Data Platforms',
    'Senior Product Manager', 'Lead Security Architect', 'VP of Talent & People', 'Founder & Managing Partner'
  ];

  const cities = ['San Francisco', 'New York', 'Austin', 'Boston', 'Seattle', 'Chicago', 'Denver', 'Los Angeles', 'Toronto', 'London'];
  const leadStatuses = ['Qualified', 'Contacted', 'Nurturing', 'Customer', 'New'];

  const contacts: any[] = [];
  for (let i = 0; i < 75; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const comp = companies[i % companies.length];
    const domain = comp.domain || 'example.com';
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const title = titles[i % titles.length];
    const city = cities[i % cities.length];
    const leadScore = Math.floor(40 + Math.random() * 58); // 40 to 98
    const leadStatus = leadStatuses[i % leadStatuses.length];

    const contact = await prisma.contact.create({
      data: {
        firstName: fn,
        lastName: ln,
        email,
        phone: `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        companyId: comp.id,
        leadScore,
        leadStatus,
        tags: JSON.stringify(['B2B', comp.industry, leadScore > 75 ? 'High Value' : 'Standard']),
        city,
        country: 'United States',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + (i * 1234567) % 50000000}?w=150`,
        bio: `${title} at ${comp.name} overseeing technical initiatives and strategic vendor partnerships.`,
        linkedinUrl: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        workspaceId: workspace.id,
      },
    });
    contacts.push(contact);
  }

  // 6. Create 135 Registrations Across Events
  const utmSources = ['LinkedIn', 'Direct', 'Email', 'Partner', 'Google'];
  const utmMediums = ['cpc', 'organic', 'newsletter', 'referral', 'social'];
  const utmCampaigns = ['spring_promo_2026', 'q1_outreach', 'partner_blast', 'tech_leader_series', 'executive_circle'];
  const ticketTypes = ['General', 'VIP', 'Speaker', 'Sponsor'];

  const registrations: any[] = [];
  let regCount = 0;

  // Distribute contacts across events
  // Event 0: Business Innovation Forum 2026 (Upcoming, ~45 registrations)
  // Event 1: Global SaaS Summit 2026 (Upcoming, ~35 registrations)
  // Event 2: Enterprise AI Workshop (Upcoming, ~25 registrations)
  // Event 3: Cybersecurity Resilience Roundtable (Completed, ~20 registrations, attended)
  // Event 4: B2B Marketing Masterclass (Completed, ~15 registrations, attended)
  // Event 5: Executive Leadership Retreat (Draft, 0 registrations)

  const distribution = [
    { eventIndex: 0, count: 42, isPast: false },
    { eventIndex: 1, count: 34, isPast: false },
    { eventIndex: 2, count: 24, isPast: false },
    { eventIndex: 3, count: 20, isPast: true },
    { eventIndex: 4, count: 15, isPast: true },
  ];

  for (const dist of distribution) {
    const targetEvent = events[dist.eventIndex];
    // Pick contacts with offset
    for (let cIdx = 0; cIdx < dist.count; cIdx++) {
      const contact = contacts[(cIdx + dist.eventIndex * 7) % contacts.length];
      
      // Determine status
      let regStatus = 'Confirmed';
      let checkInTime: Date | null = null;
      if (dist.isPast) {
        if (cIdx % 5 === 0) {
          regStatus = 'No-show';
        } else if (cIdx % 10 === 9) {
          regStatus = 'Cancelled';
        } else {
          regStatus = 'Attended';
          checkInTime = new Date(targetEvent.startDate.getTime() + (cIdx * 120000));
        }
      } else {
        if (cIdx % 8 === 0) {
          regStatus = 'Registered';
        } else if (cIdx % 15 === 14) {
          regStatus = 'Cancelled';
        } else {
          regStatus = 'Confirmed';
        }
      }

      const utmSource = utmSources[cIdx % utmSources.length];
      const utmMedium = utmMediums[cIdx % utmMediums.length];
      const utmCampaign = utmCampaigns[cIdx % utmCampaigns.length];
      const ticketType = ticketTypes[cIdx % ticketTypes.length];

      try {
        const reg = await prisma.registration.create({
          data: {
            eventId: targetEvent.id,
            contactId: contact.id,
            ticketType,
            status: regStatus,
            utmSource,
            utmMedium,
            utmCampaign,
            checkInTime,
            notes: `Auto-registered via ${utmSource} channel campaign.`,
            customAnswers: JSON.stringify({
              dietaryPreference: ['None', 'Vegetarian', 'Gluten-Free', 'Vegan'][cIdx % 4],
              attendingNetworkingDinner: cIdx % 2 === 0,
            }),
            createdAt: new Date(Date.now() - (30 - (cIdx % 30)) * 86400000),
          },
        });
        registrations.push(reg);
        regCount++;
      } catch (err) {
        // Unique constraint skip
      }
    }
  }

  // Update counts on events
  for (const ev of events) {
    const totalReg = await prisma.registration.count({
      where: { eventId: ev.id, status: { not: 'Cancelled' } },
    });
    const totalAttended = await prisma.registration.count({
      where: { eventId: ev.id, status: 'Attended' },
    });
    await prisma.event.update({
      where: { id: ev.id },
      data: {
        registeredCount: totalReg,
        attendedCount: totalAttended,
      },
    });
  }

  // 7. Create 12 High-Value Opportunities
  const oppData = [
    { title: 'CloudScale Enterprise Platform Expansion', value: 145000, stage: 'Proposal', probability: 70, compIdx: 0, contactIdx: 0, eventIdx: 0 },
    { title: 'FinTech Pulse Core Payment Engine Integration', value: 280000, stage: 'Negotiation', probability: 85, compIdx: 1, contactIdx: 1, eventIdx: 1 },
    { title: 'NexGen Autonomous Warehouse POC', value: 95000, stage: 'Qualified', probability: 50, compIdx: 2, contactIdx: 2, eventIdx: 0 },
    { title: 'CyberShield Zero-Trust Corporate Deployment', value: 320000, stage: 'Won', probability: 100, compIdx: 3, contactIdx: 3, eventIdx: 3 },
    { title: 'HealthSpan HIPAA Compliance Telemetry System', value: 110000, stage: 'Discovery', probability: 30, compIdx: 4, contactIdx: 4, eventIdx: 2 },
    { title: 'OmniCommerce Multi-Store Cloud Orchestrator', value: 175000, stage: 'Proposal', probability: 65, compIdx: 6, contactIdx: 6, eventIdx: 1 },
    { title: 'Apex Biopharma Clinical Data Lake', value: 450000, stage: 'Negotiation', probability: 90, compIdx: 7, contactIdx: 7, eventIdx: 0 },
    { title: 'Hyperion Smart Grid Analytics Software', value: 210000, stage: 'Won', probability: 100, compIdx: 8, contactIdx: 8, eventIdx: 3 },
    { title: 'Quantum Leap Simulation Benchmarking License', value: 85000, stage: 'Qualified', probability: 45, compIdx: 9, contactIdx: 9, eventIdx: 2 },
    { title: 'Starlight Logistics Freight Tracking Portal', value: 130000, stage: 'Discovery', probability: 25, compIdx: 10, contactIdx: 10, eventIdx: 1 },
    { title: 'Argus Security Endpoint Defense Suite', value: 160000, stage: 'Won', probability: 100, compIdx: 15, contactIdx: 15, eventIdx: 3 },
    { title: 'Synthetix AI Copilot Infrastructure Contract', value: 75000, stage: 'Lost', probability: 0, compIdx: 13, contactIdx: 13, eventIdx: 4 },
  ];

  const opportunities: any[] = [];
  for (const od of oppData) {
    const opp = await prisma.opportunity.create({
      data: {
        title: od.title,
        value: od.value,
        stage: od.stage,
        probability: od.probability,
        closeDate: new Date(Date.now() + 30 * 86400000),
        companyId: companies[od.compIdx % companies.length].id,
        contactId: contacts[od.contactIdx % contacts.length].id,
        eventId: events[od.eventIdx % events.length].id,
        notes: `Enterprise opportunity pipeline tied to engagement at ${events[od.eventIdx].title}.`,
        workspaceId: workspace.id,
      },
    });
    opportunities.push(opp);
  }

  // 8. Create 22 Tasks
  const taskTitles = [
    { title: 'Follow up on VIP breakfast invitation', priority: 'High', status: 'Pending', daysOffset: 2 },
    { title: 'Review keynote speaker presentation slides', priority: 'Urgent', status: 'In_Progress', daysOffset: 1 },
    { title: 'Finalize catering headcount for reception', priority: 'Medium', status: 'Completed', daysOffset: -3 },
    { title: 'Send contract renewal terms to CloudScale', priority: 'Urgent', status: 'Pending', daysOffset: 4 },
    { title: 'Prepare booth sponsorship pack for FinTech Pulse', priority: 'High', status: 'In_Progress', daysOffset: 3 },
    { title: 'Schedule post-event demo with CyberShield VP', priority: 'Medium', status: 'Completed', daysOffset: -5 },
    { title: 'Verify attendee badge printing proofs', priority: 'High', status: 'Pending', daysOffset: 5 },
    { title: 'Coordinate AV rehearsal for Main Stage', priority: 'Urgent', status: 'Pending', daysOffset: 6 },
    { title: 'Conduct pre-event qualification call with NexGen', priority: 'Medium', status: 'In_Progress', daysOffset: 2 },
    { title: 'Audit registration UTM parameters from LinkedIn campaign', priority: 'Low', status: 'Completed', daysOffset: -8 },
    { title: 'Send custom workshop agenda to registered leads', priority: 'High', status: 'Pending', daysOffset: 7 },
    { title: 'Organize executive dinner seating chart', priority: 'Medium', status: 'Pending', daysOffset: 8 },
    { title: 'Review security compliance waivers for on-site media', priority: 'Low', status: 'In_Progress', daysOffset: 4 },
    { title: 'Prepare post-roundtable whitepaper summary for attendees', priority: 'High', status: 'Completed', daysOffset: -12 },
    { title: 'Follow up with unconfirmed VIP registrations', priority: 'Urgent', status: 'Pending', daysOffset: 1 },
    { title: 'Sync lead score updates with Salesforce integration', priority: 'Medium', status: 'In_Progress', daysOffset: 3 },
    { title: 'Draft closing keynote thank-you note', priority: 'Low', status: 'Pending', daysOffset: 10 },
    { title: 'Analyze Q1 event conversion funnel dropoffs', priority: 'Medium', status: 'Completed', daysOffset: -14 },
    { title: 'Confirm hotel room blocks for international speakers', priority: 'High', status: 'In_Progress', daysOffset: 5 },
    { title: 'Collect session feedback ratings for Masterclass', priority: 'Medium', status: 'Completed', daysOffset: -10 },
    { title: 'Schedule pipeline review with Enterprise sales team', priority: 'High', status: 'Pending', daysOffset: 2 },
    { title: 'Send AI-generated meeting summaries to attendees', priority: 'Medium', status: 'Completed', daysOffset: -4 },
  ];

  const tasks: any[] = [];
  for (let t = 0; t < taskTitles.length; t++) {
    const item = taskTitles[t];
    const createdTask = await prisma.task.create({
      data: {
        title: item.title,
        description: `Operational task assigned for flawless execution of event benchmarks and pipeline acceleration.`,
        dueDate: new Date(Date.now() + item.daysOffset * 86400000),
        priority: item.priority,
        status: item.status,
        contactId: contacts[t % contacts.length].id,
        eventId: events[t % events.length].id,
        assignedToId: [userSarah.id, userMarcus.id, userElena.id][t % 3],
        workspaceId: workspace.id,
      },
    });
    tasks.push(createdTask);
  }

  // 9. Create 45 Activities
  const activityData = [
    { type: 'REGISTRATION_CREATED', title: 'New VIP Registration', desc: 'Registered for Business Innovation Forum 2026', cIdx: 0, eIdx: 0 },
    { type: 'CHECK_IN', title: 'Attendee Checked In', desc: 'Checked in at registration desk for Cybersecurity Resilience Roundtable', cIdx: 3, eIdx: 3 },
    { type: 'OPPORTUNITY_STAGE_CHANGED', title: 'Opportunity Moved to Proposal', desc: 'CloudScale Enterprise Platform Expansion deal progressed to Proposal stage', cIdx: 0, eIdx: 0, oIdx: 0 },
    { type: 'NOTE_ADDED', title: 'Meeting Note Added', desc: 'Discussion regarding multi-year cloud licensing and custom security add-ons', cIdx: 1, eIdx: 1 },
    { type: 'TASK_COMPLETED', title: 'Follow-up Task Completed', desc: 'Post-event demo scheduled with VP of Engineering', cIdx: 2, eIdx: 0 },
    { type: 'AI_INSIGHT_GENERATED', title: 'AI Lead Brief Generated', desc: 'Executive intelligence dossier compiled for Business Innovation Forum keynote lead', cIdx: 4, eIdx: 0 },
    { type: 'EMAIL_SENT', title: 'Personalized Welcome Sent', desc: 'VIP attendee kit and session selector delivered via email', cIdx: 5, eIdx: 1 },
    { type: 'STATUS_CHANGED', title: 'Registration Confirmed', desc: 'VIP seat confirmed with confirmed dietary requests', cIdx: 6, eIdx: 0 },
    { type: 'OPPORTUNITY_STAGE_CHANGED', title: 'Deal Won', desc: 'CyberShield Zero-Trust corporate deployment closed for $320,000', cIdx: 3, eIdx: 3, oIdx: 3 },
    { type: 'MEETING_LOGGED', title: 'Executive Briefing Conducted', desc: 'Strategic roundtable follow-up on quantum readiness and governance', cIdx: 9, eIdx: 2 },
  ];

  for (let a = 0; a < 45; a++) {
    const template = activityData[a % activityData.length];
    await prisma.activity.create({
      data: {
        type: template.type,
        title: `${template.title} #${a + 1}`,
        description: template.desc,
        metadata: JSON.stringify({ source: 'automation_engine', severity: 'info', index: a }),
        contactId: contacts[(a + (template.cIdx || 0)) % contacts.length].id,
        eventId: events[(a + (template.eIdx || 0)) % events.length].id,
        opportunityId: opportunities[a % opportunities.length].id,
        userId: [userSarah.id, userMarcus.id, userElena.id][a % 3],
        workspaceId: workspace.id,
        createdAt: new Date(Date.now() - (45 - a) * 3600000 * 8),
      },
    });
  }

  // 10. Pre-seed AI Interactions
  await prisma.aIInteraction.create({
    data: {
      type: 'event_brief',
      prompt: 'Generate an executive briefing for Business Innovation Forum 2026',
      response: '### Executive Brief: Business Innovation Forum 2026\n\n- **Target Audience**: 350 Fortune 1000 CTOs, CIOs, and VPs of Engineering.\n- **Key Value Drivers**: Showcase enterprise transformation case studies, foster high-value pipeline generation ($350k+ target), and position EventFlow as the gold standard for executive convenings.\n- **Core Focus Tracks**: 1. Enterprise Agentic AI Orchestration; 2. Modern Cyber Resiliency; 3. Scalable Micro-SaaS Business Architectures.',
      model: 'gemini-1.5-pro',
      eventId: events[0].id,
    },
  });

  await prisma.aIInteraction.create({
    data: {
      type: 'lead_classification',
      prompt: 'Classify lead David Vance from CloudScale Systems',
      response: '{"tier": "Tier-1 Enterprise Decision Maker", "score": 94, "intent": "High - Actively seeking multi-cloud event orchestration and security observability", "recommendedAction": "Immediate 1-on-1 executive demo and invitation to private VIP dinner."}',
      model: 'gemini-1.5-pro',
      contactId: contacts[0].id,
    },
  });

  console.log(`Database seeded successfully!
- Workspace: ${workspace.name}
- Users: 3
- Companies: ${companies.length}
- Events: ${events.length}
- Contacts: ${contacts.length}
- Registrations: ${regCount}
- Opportunities: ${opportunities.length}
- Tasks: ${tasks.length}
- Activities: 45
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
