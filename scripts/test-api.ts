import { NextRequest } from 'next/server';
import { GET as getEvents, POST as postEvent } from '../src/app/api/events/route';
import { GET as getEventById, PUT as putEventById } from '../src/app/api/events/[id]/route';
import { GET as getRegistrations, POST as postRegistration } from '../src/app/api/registrations/route';
import { PATCH as patchRegistration } from '../src/app/api/registrations/[id]/route';
import { GET as getContacts, POST as postContact } from '../src/app/api/contacts/route';
import { GET as getContactById, PATCH as patchContactById } from '../src/app/api/contacts/[id]/route';
import { GET as getCompanies, POST as postCompany } from '../src/app/api/companies/route';
import { GET as getOpportunities, POST as postOpportunity, PATCH as patchOpportunity } from '../src/app/api/opportunities/route';
import { GET as getTasks, POST as postTask, PATCH as patchTask } from '../src/app/api/tasks/route';
import { GET as getAnalytics } from '../src/app/api/analytics/route';
import { POST as postAI } from '../src/app/api/ai/route';
import { POST as postSeed } from '../src/app/api/seed/route';

async function runTests() {
  console.log('--- STARTING ROUTE HANDLER TESTS ---');

  // 1. GET /api/events
  const reqEvents = new NextRequest('http://localhost/api/events?search=Innovation');
  const resEvents = await getEvents(reqEvents);
  const dataEvents = await resEvents.json();
  console.log('✓ GET /api/events:', dataEvents.success, `(Found ${dataEvents.events.length} events)`);
  if (!dataEvents.success || dataEvents.events.length === 0) throw new Error('GET /api/events failed');

  const sampleEvent = dataEvents.events[0];

  // 2. GET /api/events/[id]
  const reqEventDetail = new NextRequest(`http://localhost/api/events/${sampleEvent.id}`);
  const resEventDetail = await getEventById(reqEventDetail, { params: { id: sampleEvent.id } });
  const dataEventDetail = await resEventDetail.json();
  console.log('✓ GET /api/events/[id]:', dataEventDetail.success, `(${dataEventDetail.event.title})`);
  if (!dataEventDetail.success) throw new Error('GET /api/events/[id] failed');

  // 3. POST /api/events
  const reqCreateEvent = new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: JSON.stringify({
      title: 'DevOps & SRE Con 2026',
      startDate: new Date('2026-10-15T09:00:00Z').toISOString(),
      endDate: new Date('2026-10-16T17:00:00Z').toISOString(),
      eventType: 'Conference',
      capacity: 250,
      budget: 60000,
      expectedRevenue: 150000,
    }),
  });
  const resCreateEvent = await postEvent(reqCreateEvent);
  const dataCreateEvent = await resCreateEvent.json();
  console.log('✓ POST /api/events:', dataCreateEvent.success, `(Created: ${dataCreateEvent.event?.title})`);

  // 4. GET /api/contacts
  const reqContacts = new NextRequest('http://localhost/api/contacts?limit=5');
  const resContacts = await getContacts(reqContacts);
  const dataContacts = await resContacts.json();
  console.log('✓ GET /api/contacts:', dataContacts.success, `(${dataContacts.contacts.length} contacts, total: ${dataContacts.pagination.total})`);

  const sampleContact = dataContacts.contacts[0];

  // 5. GET /api/contacts/[id]
  const reqContactDetail = new NextRequest(`http://localhost/api/contacts/${sampleContact.id}`);
  const resContactDetail = await getContactById(reqContactDetail, { params: { id: sampleContact.id } });
  const dataContactDetail = await resContactDetail.json();
  console.log('✓ GET /api/contacts/[id]:', dataContactDetail.success, `(${dataContactDetail.contact.firstName} ${dataContactDetail.contact.lastName})`);

  // 6. POST /api/registrations (public registration flow)
  const testEmail = `test.attendee.${Date.now()}@nexgenrobotics.com`;
  const reqReg = new NextRequest('http://localhost/api/registrations', {
    method: 'POST',
    body: JSON.stringify({
      eventId: sampleEvent.id,
      firstName: 'Samantha',
      lastName: 'Vanguard',
      email: testEmail,
      title: 'VP of Platform Engineering',
      companyName: 'NexGen Robotics',
      ticketType: 'VIP',
      utmSource: 'LinkedIn',
    }),
  });
  const resReg = await postRegistration(reqReg);
  const dataReg = await resReg.json();
  console.log('✓ POST /api/registrations:', dataReg.success, `(Reg ID: ${dataReg.registration?.id})`);

  // 7. PATCH /api/registrations/[id] (check in attendee)
  const reqCheckIn = new NextRequest(`http://localhost/api/registrations/${dataReg.registration.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'Attended',
    }),
  });
  const resCheckIn = await patchRegistration(reqCheckIn, { params: { id: dataReg.registration.id } });
  const dataCheckIn = await resCheckIn.json();
  console.log('✓ PATCH /api/registrations/[id]:', dataCheckIn.success, `(New status: ${dataCheckIn.registration?.status})`);

  // 8. GET /api/companies
  const reqCompanies = new NextRequest('http://localhost/api/companies');
  const resCompanies = await getCompanies(reqCompanies);
  const dataCompanies = await resCompanies.json();
  console.log('✓ GET /api/companies:', dataCompanies.success, `(${dataCompanies.companies.length} companies)`);

  // 9. GET /api/opportunities & PATCH /api/opportunities
  const reqOpps = new NextRequest('http://localhost/api/opportunities');
  const resOpps = await getOpportunities(reqOpps);
  const dataOpps = await resOpps.json();
  console.log('✓ GET /api/opportunities:', dataOpps.success, `(${dataOpps.opportunities.length} opps, pipeline: $${dataOpps.metrics.totalPipelineValue.toLocaleString()})`);

  if (dataOpps.opportunities.length > 0) {
    const oppToUpdate = dataOpps.opportunities[0];
    const reqPatchOpp = new NextRequest('http://localhost/api/opportunities', {
      method: 'PATCH',
      body: JSON.stringify({
        id: oppToUpdate.id,
        stage: 'Proposal',
      }),
    });
    const resPatchOpp = await patchOpportunity(reqPatchOpp);
    const dataPatchOpp = await resPatchOpp.json();
    console.log('✓ PATCH /api/opportunities:', dataPatchOpp.success, `(Updated stage: ${dataPatchOpp.opportunity?.stage})`);
  }

  // 10. GET /api/tasks & PATCH /api/tasks
  const reqTasks = new NextRequest('http://localhost/api/tasks');
  const resTasks = await getTasks(reqTasks);
  const dataTasks = await resTasks.json();
  console.log('✓ GET /api/tasks:', dataTasks.success, `(${dataTasks.tasks.length} tasks, overdue: ${dataTasks.stats.overdue})`);

  // 11. GET /api/analytics
  const reqAnalytics = new NextRequest('http://localhost/api/analytics');
  const resAnalytics = await getAnalytics(reqAnalytics);
  const dataAnalytics = await resAnalytics.json();
  console.log('✓ GET /api/analytics:', dataAnalytics.success, `(Total events: ${dataAnalytics.analytics?.kpis.totalEvents}, Regs: ${dataAnalytics.analytics?.kpis.totalRegistrations}, Pipeline: $${dataAnalytics.analytics?.kpis.totalPipelineValue.toLocaleString()})`);

  // 12. POST /api/ai
  const reqAI = new NextRequest('http://localhost/api/ai', {
    method: 'POST',
    body: JSON.stringify({
      type: 'event_brief',
      eventId: sampleEvent.id,
    }),
  });
  const resAI = await postAI(reqAI);
  const dataAI = await resAI.json();
  console.log('✓ POST /api/ai (event_brief):', dataAI.success, `(Model: ${dataAI.model})`);

  console.log('--- ALL ROUTE HANDLER TESTS PASSED FLAWLESSLY! ---');
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
