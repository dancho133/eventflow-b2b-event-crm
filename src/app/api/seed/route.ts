import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('API trigger: Re-seeding database...');

    // 1. Clean existing records in dependency order
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

    // 2. Create Workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: 'EventFlow Global HQ',
        slug: 'eventflow-hq',
        domain: 'eventflow.io',
      },
    });

    // 3. Create Users
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

    // 4. Create Companies
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
        data: { ...c, workspaceId: workspace.id },
      });
      companies.push(created);
    }

    // 5. Create Events
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
      const created = await prisma.event.create({ data: e });
      events.push(created);
    }

    // 6. Create Contacts
    const firstNames = [
      'David', 'Jessica', 'Michael', 'Samantha', 'Robert', 'Emily', 'James', 'Ashley', 'William', 'Amanda',
      'Alexander', 'Sarah', 'Daniel', 'Olivia', 'Matthew', 'Sophia', 'Christopher', 'Isabella', 'Andrew', 'Mia',
      'Joshua', 'Charlotte', 'Joseph', 'Amelia', 'Kevin', 'Harper', 'Brian', 'Evelyn', 'George', 'Abigail',
    ];
    const lastNames = [
      'Vance', 'Sterling', 'Thornton', 'Blackwood', 'Sinclair', 'Montgomery', 'Kowalski', 'Kaufman', 'Hawthorne', 'Mercer',
      'Gallagher', 'Novak', 'Chambers', 'Prescott', 'Winters', 'Delgado', 'Kensington', 'Holloway', 'Sutherland', 'Winslow',
    ];
    const titles = [
      'Chief Technology Officer', 'VP of Engineering', 'Director of Enterprise Architecture', 'Chief Revenue Officer',
      'Head of Product Strategy', 'Director of Cloud Operations', 'VP of Strategic Partnerships', 'Chief Information Security Officer',
    ];

    const contacts: any[] = [];
    for (let i = 0; i < 75; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const comp = companies[i % companies.length];
      const domain = comp.domain || 'example.com';
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@${domain}`;
      const title = titles[i % titles.length];
      const leadScore = Math.floor(40 + Math.random() * 58);

      const contact = await prisma.contact.create({
        data: {
          firstName: fn,
          lastName: ln,
          email,
          phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
          title,
          companyId: comp.id,
          leadScore,
          leadStatus: ['Qualified', 'Contacted', 'Nurturing', 'Customer', 'New'][i % 5],
          tags: JSON.stringify(['B2B', comp.industry]),
          city: 'San Francisco',
          country: 'United States',
          bio: `${title} at ${comp.name}.`,
          workspaceId: workspace.id,
        },
      });
      contacts.push(contact);
    }

    // 7. Create Registrations
    const utmSources = ['LinkedIn', 'Direct', 'Email', 'Partner', 'Google'];
    const distribution = [
      { eventIndex: 0, count: 42, isPast: false },
      { eventIndex: 1, count: 34, isPast: false },
      { eventIndex: 2, count: 24, isPast: false },
      { eventIndex: 3, count: 20, isPast: true },
      { eventIndex: 4, count: 15, isPast: true },
    ];

    let regCount = 0;
    for (const dist of distribution) {
      const ev = events[dist.eventIndex];
      for (let c = 0; c < dist.count; c++) {
        const contact = contacts[(c + dist.eventIndex * 7) % contacts.length];
        const status = dist.isPast ? (c % 5 === 0 ? 'No-show' : 'Attended') : (c % 8 === 0 ? 'Registered' : 'Confirmed');
        try {
          await prisma.registration.create({
            data: {
              eventId: ev.id,
              contactId: contact.id,
              ticketType: ['General', 'VIP', 'Speaker', 'Sponsor'][c % 4],
              status,
              utmSource: utmSources[c % utmSources.length],
              checkInTime: status === 'Attended' ? new Date() : null,
              notes: 'Public registration flow.',
            },
          });
          regCount++;
        } catch {
          // Skip unique collision
        }
      }
    }

    // Update event registration counts
    for (const ev of events) {
      const totalReg = await prisma.registration.count({ where: { eventId: ev.id, status: { not: 'Cancelled' } } });
      const totalAtt = await prisma.registration.count({ where: { eventId: ev.id, status: 'Attended' } });
      await prisma.event.update({
        where: { id: ev.id },
        data: { registeredCount: totalReg, attendedCount: totalAtt },
      });
    }

    // 8. Create Opportunities
    const oppData = [
      { title: 'CloudScale Enterprise Platform Expansion', value: 145000, stage: 'Proposal', probability: 70, cIdx: 0, compIdx: 0, eIdx: 0 },
      { title: 'FinTech Pulse Core Payment Engine Integration', value: 280000, stage: 'Negotiation', probability: 85, cIdx: 1, compIdx: 1, eIdx: 1 },
      { title: 'NexGen Autonomous Warehouse POC', value: 95000, stage: 'Qualified', probability: 50, cIdx: 2, compIdx: 2, eIdx: 0 },
      { title: 'CyberShield Zero-Trust Corporate Deployment', value: 320000, stage: 'Won', probability: 100, cIdx: 3, compIdx: 3, eIdx: 3 },
      { title: 'Hyperion Smart Grid Analytics Software', value: 210000, stage: 'Won', probability: 100, cIdx: 4, compIdx: 8, eIdx: 3 },
    ];

    for (const od of oppData) {
      await prisma.opportunity.create({
        data: {
          title: od.title,
          value: od.value,
          stage: od.stage,
          probability: od.probability,
          companyId: companies[od.compIdx].id,
          contactId: contacts[od.cIdx].id,
          eventId: events[od.eIdx].id,
          workspaceId: workspace.id,
        },
      });
    }

    // 9. Create Tasks
    const taskData = [
      { title: 'Follow up on VIP breakfast invitation', priority: 'High', status: 'Pending' },
      { title: 'Review keynote speaker presentation slides', priority: 'Urgent', status: 'In_Progress' },
      { title: 'Finalize catering headcount for reception', priority: 'Medium', status: 'Completed' },
      { title: 'Send contract renewal terms to CloudScale', priority: 'Urgent', status: 'Pending' },
      { title: 'Audit registration UTM parameters from campaign', priority: 'Low', status: 'Completed' },
    ];

    for (let t = 0; t < taskData.length; t++) {
      const item = taskData[t];
      await prisma.task.create({
        data: {
          title: item.title,
          priority: item.priority,
          status: item.status,
          contactId: contacts[t].id,
          eventId: events[t % events.length].id,
          assignedToId: userSarah.id,
          workspaceId: workspace.id,
        },
      });
    }

    // 10. Create Sample Activities
    await prisma.activity.create({
      data: {
        type: 'REGISTRATION_CREATED',
        title: 'Demo Data Re-seeded',
        description: 'Complete workspace database reset and re-seeded with demo records.',
        workspaceId: workspace.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database re-seeded successfully with demo data.',
      stats: {
        workspace: workspace.name,
        events: events.length,
        companies: companies.length,
        contacts: contacts.length,
        registrations: regCount,
      },
    });
  } catch (error: any) {
    console.error('Error re-seeding database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
