/**
 * EventFlow - 10-Step Primary Journey Verification Script
 *
 * Verifies the complete end-to-end B2B Event Operations & CRM Lifecycle:
 *  - Step 1: Initialize/check organizer dashboard
 *  - Step 2: Create a new event with target audience and responsible manager
 *  - Step 3: Fetch public registration page by slug
 *  - Step 4: Register participant with consent
 *  - Step 5: Verify registration persistence in DB
 *  - Step 6: Verify contact & company creation/linkage in CRM
 *  - Step 7: Verify duplicate registration handling (same email does not duplicate contact)
 *  - Step 8: Update attendance (Registered -> Confirmed -> Attended)
 *  - Step 9: Create follow-up task
 *  - Step 10: Verify real analytics update from DB
 */

import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/db';
import { GET as getAnalytics } from '../src/app/api/analytics/route';
import { POST as createEvent, GET as getEvents } from '../src/app/api/events/route';
import { GET as getEventDetail } from '../src/app/api/events/[id]/route';
import { POST as createRegistration, GET as getRegistrations } from '../src/app/api/registrations/route';
import { PATCH as updateRegistration } from '../src/app/api/registrations/[id]/route';
import { GET as getContact } from '../src/app/api/contacts/[id]/route';
import { POST as createTask, GET as getTasks } from '../src/app/api/tasks/route';

let passedAssertions = 0;
let failedAssertions = 0;
const resultsLog: { step: number; name: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

function assert(condition: boolean, step: number, stepName: string, detail: string) {
  if (condition) {
    passedAssertions++;
    resultsLog.push({ step, name: stepName, status: 'PASS', details: detail });
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m Step ${step} (${stepName}): ${detail}`);
  } else {
    failedAssertions++;
    resultsLog.push({ step, name: stepName, status: 'FAIL', details: detail });
    console.error(`  \x1b[31m✖ [FAIL]\x1b[0m Step ${step} (${stepName}): ${detail}`);
    throw new Error(`Assertion failed at Step ${step} [${stepName}]: ${detail}`);
  }
}

async function runJourneyVerification() {
  console.log('\n================================================================');
  console.log('🔍 EVENTFLOW: 10-STEP PRIMARY JOURNEY AUTOMATED VERIFICATION');
  console.log('================================================================\n');

  let testEventId = '';
  let testEventSlug = '';
  let testSecondEventId = '';
  let testRegistrationId = '';
  let testContactId = '';
  let testTaskId = '';
  let testManagerId = '';

  // --------------------------------------------------------------------------
  // STEP 1: Initialize/check organizer dashboard
  // --------------------------------------------------------------------------
  console.log('\x1b[36m--- STEP 1: INITIALIZE / CHECK ORGANIZER DASHBOARD ---\x1b[0m');
  {
    // Ensure default workspace exists
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: 'EventFlow HQ', slug: 'eventflow-hq' },
      });
    }
    assert(workspace !== null && !!workspace.id, 1, 'Organizer Dashboard', 'Default workspace verified or initialized');

    // Ensure at least one responsible manager user exists
    let manager = await prisma.user.findFirst({ where: { role: 'ORGANIZER' } });
    if (!manager) {
      manager = await prisma.user.create({
        data: {
          name: 'Sarah Jenkins',
          email: `sarah.jenkins.${Date.now()}@eventflow.internal`,
          role: 'ORGANIZER',
          workspaceId: workspace.id,
        },
      });
    }
    testManagerId = manager.id;
    assert(!!testManagerId, 1, 'Organizer Dashboard', `Responsible Manager active: ${manager.name} (${manager.email})`);

    // Fetch analytics route to verify dashboard KPIs endpoint
    const req = new NextRequest('http://localhost:3000/api/analytics');
    const res = await getAnalytics(req);
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 1, 'Organizer Dashboard', 'GET /api/analytics responded with HTTP 200 and success=true');

    const kpis = data.analytics?.kpis || data.kpis;
    assert(kpis !== undefined && typeof kpis.totalEvents === 'number', 1, 'Organizer Dashboard', `Dashboard KPI metrics unpacked successfully (Current Events: ${kpis?.totalEvents ?? 0}, Regs: ${kpis?.totalRegistrations ?? 0})`);
  }

  // --------------------------------------------------------------------------
  // STEP 2: Create a new event with target audience and responsible manager
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 2: CREATE EVENT WITH TARGET AUDIENCE & MANAGER ---\x1b[0m');
  {
    testEventSlug = `enterprise-summit-${Date.now().toString().slice(-4)}`;
    const eventPayload = {
      title: 'Global Enterprise AI & Cloud Summit 2026',
      slug: testEventSlug,
      description: 'Executive summit focusing on enterprise cloud migration, generative AI architectures, and data governance.',
      shortDescription: 'Enterprise AI & Cloud Summit',
      eventType: 'Conference',
      status: 'Published',
      targetAudience: 'VP of Engineering, CTO, Cloud Directors, Enterprise Architects',
      createdById: testManagerId,
      managerId: testManagerId,
      responsibleManager: 'Sarah Jenkins',
      startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 31).toISOString(),
      timezone: 'America/New_York',
      location: 'Metropolitan Pavilion, New York, NY',
      capacity: 150,
      budget: 50000,
      expectedRevenue: 200000,
      tags: ['AI', 'Cloud', 'Enterprise', 'Leadership'],
    };

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(eventPayload),
    });
    const res = await createEvent(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, 2, 'Create Event', 'Event created successfully with HTTP 201');
    assert(data.event.title === 'Global Enterprise AI & Cloud Summit 2026', 2, 'Create Event', 'Event title matches payload');
    assert(data.event.slug === testEventSlug, 2, 'Create Event', `Event slug assigned: ${testEventSlug}`);
    assert(data.event.capacity === 150, 2, 'Create Event', 'Event capacity stored as 150');

    // Verify DB persistence of event
    const dbEvent = await prisma.event.findUnique({
      where: { id: data.event.id },
      include: { createdBy: true },
    });
    assert(dbEvent !== null, 2, 'Create Event', 'Event verified in SQLite database');
    assert(dbEvent?.createdById === testManagerId || dbEvent?.createdBy?.id === testManagerId, 2, 'Create Event', `Responsible Manager correctly assigned to Event (ID: ${testManagerId})`);

    testEventId = data.event.id;
  }

  // --------------------------------------------------------------------------
  // STEP 3: Fetch public registration page by slug
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 3: FETCH PUBLIC REGISTRATION PAGE BY SLUG ---\x1b[0m');
  {
    // 3a. Direct slug lookup via /api/events?slug=${slug}
    const reqSlugParam = new NextRequest(`http://localhost:3000/api/events?slug=${testEventSlug}`);
    const resSlugParam = await getEvents(reqSlugParam);
    const dataSlugParam = await resSlugParam.json();

    assert(resSlugParam.status === 200, 3, 'Fetch by Slug', 'GET /api/events?slug= responded with HTTP 200');

    const eventBySlug = dataSlugParam.event || (Array.isArray(dataSlugParam.events) ? dataSlugParam.events.find((e: any) => e.slug === testEventSlug) : null);
    assert(eventBySlug !== null && eventBySlug !== undefined, 3, 'Fetch by Slug', `Event located via slug query parameter: ${testEventSlug}`);
    assert(eventBySlug.title === 'Global Enterprise AI & Cloud Summit 2026', 3, 'Fetch by Slug', 'Event title matches created event');
    assert(eventBySlug.status === 'Published', 3, 'Fetch by Slug', 'Event status is Published and open for registration');

    // 3b. Route lookup via /api/events/[slug]
    const reqSlugRoute = new NextRequest(`http://localhost:3000/api/events/${testEventSlug}`);
    const resSlugRoute = await getEventDetail(reqSlugRoute, { params: { id: testEventSlug } });
    const dataSlugRoute = await resSlugRoute.json();

    assert(resSlugRoute.status === 200 && dataSlugRoute.success === true, 3, 'Fetch by Slug', 'GET /api/events/[slug] resolved successfully');
    assert(dataSlugRoute.event.id === testEventId, 3, 'Fetch by Slug', 'Route resolved exact matching Event ID');
  }

  // --------------------------------------------------------------------------
  // STEP 4: Register participant with consent
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 4: REGISTER PARTICIPANT WITH CONSENT ---\x1b[0m');
  const visitorEmail = `marcus.vance.${Date.now().toString().slice(-4)}@apexcloud.io`;
  {
    const registrationPayload = {
      eventId: testEventId,
      firstName: 'Marcus',
      lastName: 'Vance',
      email: visitorEmail,
      phone: '+1 (555) 019-2834',
      title: 'Chief Technology Officer',
      companyName: 'Apex Cloud Systems',
      industry: 'Enterprise Software',
      ticketType: 'VIP',
      utmSource: 'LinkedIn',
      utmMedium: 'cpc',
      utmCampaign: 'enterprise_ai_summit_q4',
      consent: true,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
      customAnswers: {
        consent: true,
        consentLanguage: 'I agree to the processing of my contact information and event communications.',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationPayload),
    });
    const res = await createRegistration(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, 4, 'Register Participant', 'Participant registered with HTTP 201 Created');
    assert(data.registration.ticketType === 'VIP', 4, 'Register Participant', 'VIP ticket type assigned');
    assert(data.registration.utmSource === 'LinkedIn', 4, 'Register Participant', 'Attribution channel attributed to LinkedIn');

    testRegistrationId = data.registration.id;
    testContactId = data.registration.contactId;
    assert(!!testRegistrationId, 4, 'Register Participant', `Registration ID generated: ${testRegistrationId}`);
    assert(!!testContactId, 4, 'Register Participant', `Contact ID linked: ${testContactId}`);
  }

  // --------------------------------------------------------------------------
  // STEP 5: Verify registration persistence in DB
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 5: VERIFY REGISTRATION PERSISTENCE IN DB ---\x1b[0m');
  {
    const dbReg = await prisma.registration.findUnique({
      where: { id: testRegistrationId },
      include: { event: true, contact: true },
    });

    assert(dbReg !== null, 5, 'DB Registration Persistence', 'Registration record found in SQLite database');
    assert(dbReg?.eventId === testEventId, 5, 'DB Registration Persistence', 'Registration links to correct Event ID');
    assert(dbReg?.contactId === testContactId, 5, 'DB Registration Persistence', 'Registration links to correct Contact ID');
    assert(dbReg?.status === 'Registered', 5, 'DB Registration Persistence', 'Initial registration status persisted as "Registered"');

    const dbEvent = await prisma.event.findUnique({ where: { id: testEventId } });
    assert(dbEvent !== null && dbEvent.registeredCount >= 1, 5, 'DB Registration Persistence', `Event registeredCount incremented to ${dbEvent?.registeredCount}`);
  }

  // --------------------------------------------------------------------------
  // STEP 6: Verify contact & company creation/linkage in CRM
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 6: VERIFY CONTACT & COMPANY CRM LINKAGE ---\x1b[0m');
  {
    const dbContact = await prisma.contact.findUnique({
      where: { id: testContactId },
      include: {
        company: true,
        registrations: true,
      },
    });

    assert(dbContact !== null, 6, 'CRM Contact & Company', 'Contact record exists in CRM database');
    assert(dbContact?.email === visitorEmail.toLowerCase(), 6, 'CRM Contact & Company', `Contact email matches: ${visitorEmail.toLowerCase()}`);
    assert(dbContact?.firstName === 'Marcus' && dbContact?.lastName === 'Vance', 6, 'CRM Contact & Company', 'Contact name verified: Marcus Vance');
    assert(dbContact?.title === 'Chief Technology Officer', 6, 'CRM Contact & Company', 'Contact executive title stored');
    assert((dbContact?.leadScore ?? 0) >= 70, 6, 'CRM Contact & Company', `Lead score qualified for CTO title: ${dbContact?.leadScore}/100`);

    // Verify Company linkage
    assert(dbContact?.company !== null && dbContact?.company !== undefined, 6, 'CRM Contact & Company', 'Contact is linked to a Company entity');
    assert(dbContact?.company?.name === 'Apex Cloud Systems', 6, 'CRM Contact & Company', 'Auto-created company entity: "Apex Cloud Systems"');
    assert(dbContact?.company?.domain === 'apexcloud.io', 6, 'CRM Contact & Company', 'Company domain extracted from work email: apexcloud.io');

    // Verify Contact 360 API route
    const reqContact = new NextRequest(`http://localhost:3000/api/contacts/${testContactId}`);
    const resContact = await getContact(reqContact, { params: { id: testContactId } });
    const dataContact = await resContact.json();

    assert(resContact.status === 200 && dataContact.success === true, 6, 'CRM Contact & Company', 'GET /api/contacts/[id] returned HTTP 200');
    assert(dataContact.contact.company.name === 'Apex Cloud Systems', 6, 'CRM Contact & Company', 'Contact 360 payload includes linked company');
  }

  // --------------------------------------------------------------------------
  // STEP 7: Verify duplicate registration handling (same email does not duplicate contact)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 7: VERIFY DUPLICATE REGISTRATION HANDLING & DEDUPLICATION ---\x1b[0m');
  {
    // 7a: Duplicate registration for the SAME event must be rejected with 409
    const dupPayload = {
      eventId: testEventId,
      firstName: 'Marcus',
      lastName: 'Vance',
      email: visitorEmail,
      ticketType: 'General',
    };

    const reqDup = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify(dupPayload),
    });
    const resDup = await createRegistration(reqDup);
    const dataDup = await resDup.json();

    assert(resDup.status === 409 && dataDup.success === false, 7, 'Deduplication', 'Duplicate registration rejected with HTTP 409 Conflict');

    // Verify contact count for this email remains exactly 1 in DB
    const contactsWithEmail = await prisma.contact.findMany({
      where: { email: visitorEmail.toLowerCase() },
    });
    assert(contactsWithEmail.length === 1, 7, 'Deduplication', 'Contact deduplication verified: Exact 1 contact record exists for this email');

    // 7b: Cross-event registration must reuse the existing contact record
    const secondEventSlug = `ai-governance-${Date.now().toString().slice(-4)}`;
    const reqSecondEvent = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Executive AI Governance Roundtable 2026',
        slug: secondEventSlug,
        description: 'Chatham house rule roundtable on enterprise AI compliance.',
        eventType: 'Workshop',
        status: 'Published',
        startDate: new Date(Date.now() + 86400000 * 45).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 46).toISOString(),
        capacity: 50,
      }),
    });
    const resSecondEvent = await createEvent(reqSecondEvent);
    const dataSecondEvent = await resSecondEvent.json();
    testSecondEventId = dataSecondEvent.event.id;

    const crossRegPayload = {
      eventId: testSecondEventId,
      firstName: 'Marcus',
      lastName: 'Vance',
      email: visitorEmail,
      ticketType: 'VIP',
    };
    const reqCross = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify(crossRegPayload),
    });
    const resCross = await createRegistration(reqCross);
    const dataCross = await resCross.json();

    assert(resCross.status === 201 && dataCross.success === true, 7, 'Deduplication', 'Second event registration succeeded');
    assert(dataCross.registration.contactId === testContactId, 7, 'Deduplication', 'Reused same contact ID across events without duplicating profile');

    const totalContactsNow = await prisma.contact.count({
      where: { email: visitorEmail.toLowerCase() },
    });
    assert(totalContactsNow === 1, 7, 'Deduplication', 'Verified 0 duplicate contacts in database after multi-event registrations');
  }

  // --------------------------------------------------------------------------
  // STEP 8: Update attendance (Registered -> Confirmed -> Attended)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 8: UPDATE ATTENDANCE (REGISTERED -> CONFIRMED -> ATTENDED) ---\x1b[0m');
  {
    // 8a: Transition to Confirmed
    const reqConfirmed = new NextRequest(`http://localhost:3000/api/registrations/${testRegistrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const resConfirmed = await updateRegistration(reqConfirmed, { params: { id: testRegistrationId } });
    const dataConfirmed = await resConfirmed.json();

    assert(resConfirmed.status === 200 && dataConfirmed.success === true, 8, 'Attendance Lifecycle', 'Status transitioned to "Confirmed"');
    assert(dataConfirmed.registration.status === 'Confirmed', 8, 'Attendance Lifecycle', 'Registration status verified as "Confirmed" in payload');

    // 8b: Transition to Attended (Check-In)
    const checkInTime = new Date().toISOString();
    const reqAttended = new NextRequest(`http://localhost:3000/api/registrations/${testRegistrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Attended', checkInTime }),
    });
    const resAttended = await updateRegistration(reqAttended, { params: { id: testRegistrationId } });
    const dataAttended = await resAttended.json();

    assert(resAttended.status === 200 && dataAttended.success === true, 8, 'Attendance Lifecycle', 'Status transitioned to "Attended" (Check-in)');
    assert(dataAttended.registration.status === 'Attended', 8, 'Attendance Lifecycle', 'Registration status verified as "Attended" in payload');
    assert(dataAttended.registration.checkInTime !== null, 8, 'Attendance Lifecycle', 'Check-in timestamp recorded in registration');

    // 8c: Verify Event attendedCount and DB Activity log
    const dbEvent = await prisma.event.findUnique({ where: { id: testEventId } });
    assert(dbEvent !== null && dbEvent.attendedCount >= 1, 8, 'Attendance Lifecycle', `Event attendedCount incremented to ${dbEvent?.attendedCount}`);

    const dbActivity = await prisma.activity.findFirst({
      where: {
        eventId: testEventId,
        contactId: testContactId,
        type: 'CHECK_IN',
      },
    });
    assert(dbActivity !== null, 8, 'Attendance Lifecycle', 'CHECK_IN activity audit log created in database');
  }

  // --------------------------------------------------------------------------
  // STEP 9: Create follow-up task
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 9: CREATE FOLLOW-UP TASK ---\x1b[0m');
  {
    const taskPayload = {
      title: 'Post-Summit CTO Follow-up: Apex Cloud Systems Architecture Review',
      description: 'Schedule a 30-minute discovery session with Marcus Vance regarding hybrid cloud deployment benchmarks discussed during keynote.',
      priority: 'High',
      status: 'Pending',
      contactId: testContactId,
      eventId: testEventId,
      assignedToId: testManagerId,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    };

    const reqTask = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskPayload),
    });
    const resTask = await createTask(reqTask);
    const dataTask = await resTask.json();

    assert(resTask.status === 201 && dataTask.success === true, 9, 'Follow-up Task', 'Follow-up task created with HTTP 201 Created');
    assert(dataTask.task.title === taskPayload.title, 9, 'Follow-up Task', 'Task title matches payload');
    assert(dataTask.task.priority === 'High', 9, 'Follow-up Task', 'Task priority set to High');
    assert(dataTask.task.status === 'Pending', 9, 'Follow-up Task', 'Task status initialized to Pending');

    testTaskId = dataTask.task.id;

    // Verify task query by contactId
    const reqGetTasks = new NextRequest(`http://localhost:3000/api/tasks?contactId=${testContactId}`);
    const resGetTasks = await getTasks(reqGetTasks);
    const dataGetTasks = await resGetTasks.json();

    assert(resGetTasks.status === 200 && dataGetTasks.success === true, 9, 'Follow-up Task', 'GET /api/tasks?contactId= returned task list');
    const foundTask = dataGetTasks.tasks.find((t: any) => t.id === testTaskId);
    assert(foundTask !== undefined, 9, 'Follow-up Task', 'Verified task in contact task queue');

    // Verify DB persistence
    const dbTask = await prisma.task.findUnique({ where: { id: testTaskId } });
    assert(dbTask !== null && dbTask.contactId === testContactId, 9, 'Follow-up Task', 'Task verified in SQLite database');
  }

  // --------------------------------------------------------------------------
  // STEP 10: Verify real analytics update from DB
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- STEP 10: VERIFY REAL ANALYTICS UPDATE FROM DB ---\x1b[0m');
  {
    const reqAnalytics = new NextRequest('http://localhost:3000/api/analytics');
    const resAnalytics = await getAnalytics(reqAnalytics);
    const dataAnalytics = await resAnalytics.json();

    assert(resAnalytics.status === 200 && dataAnalytics.success === true, 10, 'Analytics Real DB Query', 'GET /api/analytics returned HTTP 200');

    const kpis = dataAnalytics.analytics?.kpis || dataAnalytics.kpis;
    assert(kpis !== undefined, 10, 'Analytics Real DB Query', 'Analytics payload contains valid KPIs object');

    // Cross-check API KPIs directly against live SQLite database counts
    const dbTotalEvents = await prisma.event.count();
    const dbTotalRegs = await prisma.registration.count({ where: { status: { not: 'Cancelled' } } });
    const dbTotalAttendees = await prisma.registration.count({ where: { status: 'Attended' } });
    const dbTotalLeads = await prisma.contact.count();
    const dbActiveTasks = await prisma.task.count({ where: { status: { in: ['Pending', 'In_Progress'] } } });

    assert(kpis.totalEvents === dbTotalEvents, 10, 'Analytics Real DB Query', `totalEvents in API (${kpis.totalEvents}) exactly matches DB count (${dbTotalEvents})`);
    assert(kpis.totalRegistrations === dbTotalRegs, 10, 'Analytics Real DB Query', `totalRegistrations in API (${kpis.totalRegistrations}) exactly matches DB count (${dbTotalRegs})`);
    assert(kpis.totalAttendees === dbTotalAttendees, 10, 'Analytics Real DB Query', `totalAttendees in API (${kpis.totalAttendees}) exactly matches DB count (${dbTotalAttendees})`);
    assert(kpis.totalLeads === dbTotalLeads, 10, 'Analytics Real DB Query', `totalLeads in API (${kpis.totalLeads}) exactly matches DB count (${dbTotalLeads})`);
    assert(kpis.activeTasks === dbActiveTasks, 10, 'Analytics Real DB Query', `activeTasks in API (${kpis.activeTasks}) exactly matches DB count (${dbActiveTasks})`);

    const expectedRate = dbTotalRegs > 0 ? Math.round((dbTotalAttendees / dbTotalRegs) * 100) : 0;
    assert(kpis.overallAttendanceRate === expectedRate, 10, 'Analytics Real DB Query', `overallAttendanceRate (${kpis.overallAttendanceRate}%) matches computed rate (${expectedRate}%)`);

    assert(kpis.totalAttendees >= 1, 10, 'Analytics Real DB Query', 'Confirmed attendance from Step 8 is accurately reflected in live analytics');
    assert(kpis.activeTasks >= 1, 10, 'Analytics Real DB Query', 'Confirmed follow-up task from Step 9 is accurately reflected in live analytics');
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎉 10-STEP JOURNEY TEST SUMMARY: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
  console.log('================================================================\n');

  if (failedAssertions > 0) {
    console.error(`❌ Verification failed with ${failedAssertions} errors.`);
    process.exit(1);
  } else {
    console.log('✅ ALL 10 PRIMARY JOURNEY STEPS VERIFIED FLAWLESSLY AGAINST DATABASE & APIS!\n');
    process.exit(0);
  }
}

runJourneyVerification().catch((err) => {
  console.error('\n❌ Uncaught error during journey verification:', err);
  process.exit(1);
});
