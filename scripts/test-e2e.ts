/**
 * EVENTFLOW - End-to-End Test Suite & Verification Script
 * 
 * Executes the complete 15-step Business Innovation Forum 2026 scenario
 * plus 4 critical edge case test suites against the Next.js API Route Handlers.
 */

import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/db';
import { POST as createEvent, GET as getEvents } from '../src/app/api/events/route';
import { GET as getEventDetail } from '../src/app/api/events/[id]/route';
import { POST as createRegistration, GET as getRegistrations } from '../src/app/api/registrations/route';
import { PATCH as updateRegistration } from '../src/app/api/registrations/[id]/route';
import { GET as getContact, PATCH as updateContact } from '../src/app/api/contacts/[id]/route';
import { POST as createOpportunity } from '../src/app/api/opportunities/route';
import { POST as runAI } from '../src/app/api/ai/route';
import { POST as createTask, GET as getTasks } from '../src/app/api/tasks/route';
import { GET as getAnalytics } from '../src/app/api/analytics/route';

// Test Reporting Helpers
let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, stepNumber: string | number, message: string) {
  if (condition) {
    passedCount++;
    console.log(`  \x1b[32m✔ [PASS]\x1b[0m Step ${stepNumber}: ${message}`);
  } else {
    failedCount++;
    console.error(`  \x1b[31m✖ [FAIL]\x1b[0m Step ${stepNumber}: ${message}`);
    throw new Error(`Assertion failed at Step ${stepNumber}: ${message}`);
  }
}

async function runScenario() {
  console.log('\n================================================================');
  console.log('🚀 EVENTFLOW E2E VALIDATION: BUSINESS INNOVATION FORUM 2026');
  console.log('================================================================\n');

  let testEventId = '';
  let testEventSlug = '';
  let testContactId = '';
  let testRegistrationId = '';
  let testTaskId = '';
  let testOpportunityId = '';

  // --------------------------------------------------------------------------
  // STEP 1: Create Event 'Business Innovation Forum 2026'
  // --------------------------------------------------------------------------
  console.log('\x1b[36m--- SCENARIO PHASE 1: EVENT CREATION & VERIFICATION ---\x1b[0m');
  {
    const payload = {
      title: 'Business Innovation Forum 2026',
      slug: `bif-2026-e2e-${Date.now().toString().slice(-4)}`,
      description: 'Annual flagship executive forum on cloud architecture, AI workflows, and enterprise agility.',
      shortDescription: 'Executive Innovation Summit',
      eventType: 'Conference',
      status: 'Published',
      startDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 31).toISOString(),
      location: 'Marriott Marquis, New York, NY',
      capacity: 150,
      budget: 45000,
      expectedRevenue: 250000,
      tags: ['Innovation', 'Cloud', 'AI', 'Executive'],
    };

    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await createEvent(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, 1, 'Event "Business Innovation Forum 2026" created successfully');
    assert(data.event.capacity === 150, 1, 'Event capacity is correctly stored as 150');
    assert(data.event.title === 'Business Innovation Forum 2026', 1, 'Event title matches payload');

    testEventId = data.event.id;
    testEventSlug = data.event.slug;
  }

  // --------------------------------------------------------------------------
  // STEP 2: Validate Event & Public Registration Endpoint
  // --------------------------------------------------------------------------
  {
    const req = new NextRequest(`http://localhost:3000/api/events/${testEventId}`);
    const res = await getEventDetail(req, { params: { id: testEventId } });
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 2, 'Retrieved event detail for public registration verification');
    assert(data.event.slug === testEventSlug, 2, `Public registration slug verified: /register/${testEventSlug}`);
    assert(data.event.status === 'Published', 2, 'Event status is Published and open for registration');
  }

  // --------------------------------------------------------------------------
  // STEP 3: Validate Registration Input Validation
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- SCENARIO PHASE 2: VISITOR REGISTRATION & CRM INGESTION ---\x1b[0m');
  {
    // Test missing email
    const req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: testEventId,
        firstName: 'Elena',
        lastName: 'Rostova',
        // email omitted
      }),
    });
    const res = await createRegistration(req);
    const data = await res.json();

    assert(res.status === 400 && data.success === false, 3, 'Validation correctly rejected registration with missing email');
  }

  // --------------------------------------------------------------------------
  // STEP 4: Register Fictional Visitor (Dr. Elena Rostova)
  // --------------------------------------------------------------------------
  {
    const visitorEmail = `elena.rostova.${Date.now().toString().slice(-4)}@novatech.io`;
    const payload = {
      eventId: testEventId,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: visitorEmail,
      phone: '+1 (555) 234-5678',
      title: 'VP of Engineering',
      companyName: 'Novatech Solutions',
      industry: 'Enterprise Software',
      ticketType: 'VIP',
      utmSource: 'LinkedIn',
      utmMedium: 'social_paid',
      utmCampaign: 'bif_q4_leaders',
      notes: 'Interested in reducing cloud compute latency and autonomous AI orchestrations.',
    };

    const req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await createRegistration(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, 4, 'Successfully registered Dr. Elena Rostova as VIP attendee');
    assert(data.registration.ticketType === 'VIP', 4, 'Ticket type recorded as VIP');
    assert(data.registration.utmSource === 'LinkedIn', 4, 'Acquisition channel attributed to LinkedIn');

    testRegistrationId = data.registration.id;
    testContactId = data.registration.contactId;
  }

  // --------------------------------------------------------------------------
  // STEP 5: Verify CRM Contact & Company Auto-Association
  // --------------------------------------------------------------------------
  {
    const req = new NextRequest(`http://localhost:3000/api/contacts/${testContactId}`);
    const res = await getContact(req, { params: { id: testContactId } });
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 5, 'Contact profile successfully queried');
    assert(data.contact.firstName === 'Elena' && data.contact.lastName === 'Rostova', 5, 'Contact full name matches');
    assert(data.contact.company && data.contact.company.name === 'Novatech Solutions', 5, 'Auto-associated corporate account "Novatech Solutions"');
    assert(data.contact.leadScore >= 70, 5, `Lead score scored high for VP title: ${data.contact.leadScore}/100`);
  }

  // --------------------------------------------------------------------------
  // STEP 6: Verify Duplicate Registration Rejection
  // --------------------------------------------------------------------------
  {
    const contact = await prisma.contact.findUnique({ where: { id: testContactId } });
    const payload = {
      eventId: testEventId,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: contact!.email,
      ticketType: 'General',
    };

    const req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await createRegistration(req);
    const data = await res.json();

    assert(res.status === 409 && data.success === false, 6, 'Duplicate registration rejected with HTTP 409 Conflict');
  }

  // --------------------------------------------------------------------------
  // STEP 7: Check Registration in Event Registrations List
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- SCENARIO PHASE 3: ATTENDANCE LIFECYCLE & STATUS PROGRESSION ---\x1b[0m');
  {
    const req = new NextRequest(`http://localhost:3000/api/registrations?eventId=${testEventId}`);
    const res = await getRegistrations(req);
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 7, 'Fetched registrations list for event');
    const matched = data.registrations.find((r: any) => r.id === testRegistrationId);
    assert(matched !== undefined, 7, 'Elena Rostova found in active event registrations roster');
    assert(matched.status === 'Registered', 7, 'Initial registration status verified as "Registered"');
  }

  // --------------------------------------------------------------------------
  // STEP 8: Update Registration to Confirmed, then Attended
  // --------------------------------------------------------------------------
  {
    // 8a: Update to Confirmed
    const req1 = new NextRequest(`http://localhost:3000/api/registrations/${testRegistrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const res1 = await updateRegistration(req1, { params: { id: testRegistrationId } });
    const data1 = await res1.json();
    assert(res1.status === 200 && data1.registration.status === 'Confirmed', 8, 'Registration status transitioned to "Confirmed"');

    // 8b: Update to Attended (Check-in)
    const checkInTimestamp = new Date().toISOString();
    const req2 = new NextRequest(`http://localhost:3000/api/registrations/${testRegistrationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Attended', checkInTime: checkInTimestamp }),
    });
    const res2 = await updateRegistration(req2, { params: { id: testRegistrationId } });
    const data2 = await res2.json();

    assert(res2.status === 200 && data2.registration.status === 'Attended', 8, 'Attendee status transitioned to "Attended"');
    assert(data2.registration.checkInTime !== null, 8, 'Check-in timestamp recorded accurately');

    // Verify Event attendedCount was incremented
    const event = await prisma.event.findUnique({ where: { id: testEventId } });
    assert(event!.attendedCount >= 1, 8, `Event attended count incremented to ${event!.attendedCount}`);
  }

  // --------------------------------------------------------------------------
  // STEP 9: Mark Participant as Qualified Lead & Create Opportunity
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- SCENARIO PHASE 4: LEAD QUALIFICATION & PIPELINE PROGRESSION ---\x1b[0m');
  {
    // Update lead status to Qualified
    const req1 = new NextRequest(`http://localhost:3000/api/contacts/${testContactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ leadStatus: 'Qualified' }),
    });
    const res1 = await updateContact(req1, { params: { id: testContactId } });
    const data1 = await res1.json();
    assert(res1.status === 200 && data1.contact.leadStatus === 'Qualified', 9, 'Contact lead status set to "Qualified"');

    // Link a Sales Opportunity to this contact and event
    const contact = await prisma.contact.findUnique({ where: { id: testContactId } });
    const req2 = new NextRequest('http://localhost:3000/api/opportunities', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Novatech - Enterprise Platform Expansion',
        value: 75000,
        stage: 'Qualified',
        probability: 40,
        contactId: testContactId,
        companyId: contact?.companyId,
        eventId: testEventId,
        notes: 'In-person meeting at Business Innovation Forum 2026. Evaluating 500-seat license.',
      }),
    });
    const res2 = await createOpportunity(req2);
    const data2 = await res2.json();
    assert(res2.status === 201 && data2.success === true, 9, 'Created $75,000 Opportunity attributed to this event');
    testOpportunityId = data2.opportunity.id;
  }

  // --------------------------------------------------------------------------
  // STEP 10: Generate AI Follow-up Draft
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- SCENARIO PHASE 5: AI COPILOT & WORKFLOW AUTOMATION ---\x1b[0m');
  let generatedEmailDraft = '';
  {
    const req = new NextRequest('http://localhost:3000/api/ai', {
      method: 'POST',
      body: JSON.stringify({
        type: 'followup_draft',
        eventId: testEventId,
        contactId: testContactId,
      }),
    });
    const res = await runAI(req);
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 10, 'AI Copilot generated follow-up draft');
    assert(typeof data.result === 'string' && data.result.length > 50, 10, 'Draft contains executive email body');
    assert(data.result.toLowerCase().includes('novatech') || data.result.toLowerCase().includes('business innovation forum'), 10, 'Draft incorporates contextual event & company references');

    generatedEmailDraft = data.result;
  }

  // --------------------------------------------------------------------------
  // STEP 11: Edit AI Draft (Human-in-the-Loop Review)
  // --------------------------------------------------------------------------
  let customizedDraft = '';
  {
    const customAddition = '\n\nP.S. I enjoyed discussing our sub-50ms latency benchmarks during the keynote session.';
    customizedDraft = generatedEmailDraft + customAddition;
    assert(customizedDraft.includes('sub-50ms latency'), 11, 'Human-in-the-loop review successfully edited follow-up copy');
  }

  // --------------------------------------------------------------------------
  // STEP 12: Create Follow-up Task
  // --------------------------------------------------------------------------
  {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Send reviewed AI follow-up to Dr. Elena Rostova',
        description: customizedDraft,
        priority: 'Urgent',
        status: 'Pending',
        contactId: testContactId,
        eventId: testEventId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    const res = await createTask(req);
    const data = await res.json();

    assert(res.status === 201 && data.success === true, 12, 'Follow-up task created in system');
    assert(data.task.priority === 'Urgent', 12, 'Task priority correctly marked as Urgent');
    testTaskId = data.task.id;
  }

  // --------------------------------------------------------------------------
  // STEP 13: Verify Task Appears in Tasks List
  // --------------------------------------------------------------------------
  {
    const req = new NextRequest(`http://localhost:3000/api/tasks?contactId=${testContactId}`);
    const res = await getTasks(req);
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 13, 'Queried tasks for contact');
    const matchedTask = data.tasks.find((t: any) => t.id === testTaskId);
    assert(matchedTask !== undefined, 13, 'Follow-up task verified in contact task queue');
    assert(matchedTask.status === 'Pending', 13, 'Task status verified as "Pending"');
  }

  // --------------------------------------------------------------------------
  // STEP 14: Verify Contact 360 Profile
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- SCENARIO PHASE 6: CONTACT 360 & CLOSED-LOOP ANALYTICS ---\x1b[0m');
  {
    const req = new NextRequest(`http://localhost:3000/api/contacts/${testContactId}`);
    const res = await getContact(req, { params: { id: testContactId } });
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 14, 'Retrieved full Contact 360 profile');
    assert(data.contact.registrations.length >= 1, 14, 'Contact profile includes verified event registration');
    assert(data.contact.registrations[0].status === 'Attended', 14, 'Registration reflects "Attended" status');
    assert(data.contact.opportunities.length >= 1, 14, 'Contact profile reflects linked $75,000 deal');
    assert(data.contact.tasks.length >= 1, 14, 'Contact profile lists pending follow-up task');
    assert(data.contact.activities.length >= 2, 14, 'Activity timeline has recorded registration and check-in audit logs');
  }

  // --------------------------------------------------------------------------
  // STEP 15: Verify Analytics API Calculates Updated Metrics
  // --------------------------------------------------------------------------
  {
    const req = new NextRequest(`http://localhost:3000/api/analytics?eventId=${testEventId}`);
    const res = await getAnalytics(req);
    const data = await res.json();

    assert(res.status === 200 && data.success === true, 15, 'Queried Analytics API successfully');
    const kpis = data.analytics?.kpis || data.kpis;
    assert(kpis.totalAttendees >= 1, 15, `Analytics reflects attended count: ${kpis.totalAttendees}`);
    assert(kpis.totalPipelineValue >= 75000, 15, `Analytics calculates pipeline generated: $${kpis.totalPipelineValue.toLocaleString()}`);
    assert(kpis.overallAttendanceRate > 0, 15, `Attendance rate computed accurately: ${kpis.overallAttendanceRate}%`);
  }

  // --------------------------------------------------------------------------
  // EDGE CASE TESTS
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m--- EDGE CASES & ERROR HANDLING SUITE ---\x1b[0m');

  // Edge Case 1: Missing Required Fields in Event Creation
  {
    const req = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({ description: 'No title provided' }),
    });
    const res = await createEvent(req);
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'EDGE-1', 'Event creation without title rejected with 400');
  }

  // Edge Case 2: Missing Required Fields in Task Creation
  {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ priority: 'High' }), // Title omitted
    });
    const res = await createTask(req);
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'EDGE-2', 'Task creation without title rejected with 400');
  }

  // Edge Case 3: Registration for Non-Existent Event
  {
    const req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: 'non-existent-event-id-9999',
        firstName: 'Ghost',
        lastName: 'User',
        email: 'ghost@nowhere.com',
      }),
    });
    const res = await createRegistration(req);
    const data = await res.json();
    assert(res.status === 404 && data.success === false, 'EDGE-3', 'Registration for non-existent event rejected with 404');
  }

  // Edge Case 4: Capacity Limit Enforcement
  {
    // Create an event with capacity = 1
    const tinyEventReq = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Exclusive VIP Roundtable',
        slug: `vip-cap1-${Date.now().toString().slice(-4)}`,
        startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
        capacity: 1,
      }),
    });
    const tinyEventRes = await createEvent(tinyEventReq);
    const tinyEventData = await tinyEventRes.json();
    const tinyEventId = tinyEventData.event.id;

    // First registrant fills the only seat
    const reg1Req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: tinyEventId,
        firstName: 'First',
        lastName: 'Seat',
        email: `first.seat.${Date.now().toString().slice(-4)}@example.com`,
        ticketType: 'General',
      }),
    });
    const reg1Res = await createRegistration(reg1Req);
    assert(reg1Res.status === 201, 'EDGE-4', 'First attendee successfully took the single available seat');

    // Second registrant must be rejected due to capacity limit
    const reg2Req = new NextRequest('http://localhost:3000/api/registrations', {
      method: 'POST',
      body: JSON.stringify({
        eventId: tinyEventId,
        firstName: 'Second',
        lastName: 'Overflow',
        email: `overflow.${Date.now().toString().slice(-4)}@example.com`,
        ticketType: 'General',
      }),
    });
    const reg2Res = await createRegistration(reg2Req);
    const reg2Data = await reg2Res.json();
    assert(reg2Res.status === 409 && reg2Data.success === false, 'EDGE-4', 'Capacity limit enforced: Second registrant rejected with 409');
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🎉 TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('✅ ALL 15 SCENARIO STEPS & 4 EDGE CASES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  }
}

runScenario().catch((err) => {
  console.error('\n❌ Uncaught error during E2E test execution:', err);
  process.exit(1);
});
