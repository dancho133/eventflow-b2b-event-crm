import { NextRequest } from 'next/server';
import { prisma } from '../src/lib/db';
import { GET as getAnalytics } from '../src/app/api/analytics/route';
import { GET as getEvents, POST as postEvent } from '../src/app/api/events/route';
import { GET as getEventById } from '../src/app/api/events/[id]/route';
import { GET as getContactById } from '../src/app/api/contacts/[id]/route';
import { POST as postRegistration } from '../src/app/api/registrations/route';
import * as fs from 'fs';
import * as assert from 'assert';

async function verify() {
  console.log('=== VERIFYING CORE-DEV DELIVERABLES ===');

  // 1. Verify .eslintrc.json
  console.log('\n--- Test 1: ESLint Configuration ---');
  assert.ok(fs.existsSync('/home/ubuntu/eventflow/.eslintrc.json'), '.eslintrc.json must exist');
  const eslintConfig = JSON.parse(fs.readFileSync('/home/ubuntu/eventflow/.eslintrc.json', 'utf8'));
  assert.strictEqual(eslintConfig.extends, 'next/core-web-vitals', 'eslint must extend next/core-web-vitals');
  console.log('✓ .eslintrc.json configured correctly');

  // 2. Verify Analytics API Response Unpacking
  console.log('\n--- Test 2: Analytics API Response ---');
  const analyticsReq = new NextRequest('http://localhost/api/analytics');
  const analyticsRes = await getAnalytics(analyticsReq);
  const analyticsData = await analyticsRes.json();
  assert.strictEqual(analyticsData.success, true);
  assert.ok(analyticsData.analytics, 'Response must contain analytics object');
  assert.ok(analyticsData.analytics.kpis, 'analytics must contain kpis');
  assert.ok(typeof analyticsData.analytics.kpis.totalEvents === 'number', 'kpis.totalEvents must be number');
  assert.ok(analyticsData.recentActivities, 'analytics must return recentActivities from real DB');
  console.log(`✓ Analytics returned real DB stats: ${analyticsData.analytics.kpis.totalEvents} events, ${analyticsData.analytics.kpis.totalRegistrations} registrations`);

  // 3. Verify Event creation with targetAudience and responsible manager
  console.log('\n--- Test 3: Event with targetAudience and responsible manager ---');
  const user = await prisma.user.findFirst();
  assert.ok(user, 'User must exist in database');

  const testSlug = `core-dev-test-${Date.now()}`;
  const createEventReq = new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Enterprise Architecture Summit 2026',
      slug: testSlug,
      description: 'Exclusive leadership gathering for enterprise architects',
      eventType: 'Summit',
      startDate: new Date('2026-11-20T09:00:00Z').toISOString(),
      endDate: new Date('2026-11-20T17:00:00Z').toISOString(),
      capacity: 100,
      targetAudience: 'Chief Architects & VP Infrastructure',
      createdById: user.id,
    }),
  });
  const createEventRes = await postEvent(createEventReq);
  const createEventData = await createEventRes.json();
  assert.strictEqual(createEventData.success, true);
  assert.strictEqual(createEventData.event.targetAudience, 'Chief Architects & VP Infrastructure');
  assert.strictEqual(createEventData.event.createdById, user.id);
  console.log('✓ Event created with targetAudience and responsible manager createdById');

  // 4. Verify Slug lookup in /api/events?slug= and /api/events/[id]
  console.log('\n--- Test 4: Slug Lookup ---');
  const getBySlugQueryReq = new NextRequest(`http://localhost/api/events?slug=${testSlug}`);
  const getBySlugQueryRes = await getEvents(getBySlugQueryReq);
  const getBySlugQueryData = await getBySlugQueryRes.json();
  assert.strictEqual(getBySlugQueryData.success, true);
  assert.ok(getBySlugQueryData.event, 'Should return event object for slug query');
  assert.strictEqual(getBySlugQueryData.event.slug, testSlug);
  assert.ok(getBySlugQueryData.event.createdBy, 'Event must include createdBy manager');
  console.log('✓ /api/events?slug= returned single event matching slug with createdBy');

  const getBySlugParamReq = new NextRequest(`http://localhost/api/events/${testSlug}`);
  const getBySlugParamRes = await getEventById(getBySlugParamReq, { params: { id: testSlug } });
  const getBySlugParamData = await getBySlugParamRes.json();
  assert.strictEqual(getBySlugParamData.success, true);
  assert.strictEqual(getBySlugParamData.event.slug, testSlug);
  assert.ok(Array.isArray(getBySlugParamData.event.registrations), 'event.registrations must be array');
  assert.ok(Array.isArray(getBySlugParamData.event.tasks), 'event.tasks must be array');
  assert.strictEqual(getBySlugParamData.event.targetAudience, 'Chief Architects & VP Infrastructure');
  console.log('✓ /api/events/[slug] returned event with relations (registrations, tasks, createdBy)');

  // 5. Verify Contact Relations Unpacking in /api/contacts/[id]
  console.log('\n--- Test 5: Contact 360 Relations ---');
  const contact = await prisma.contact.findFirst({
    include: { registrations: true },
  });
  assert.ok(contact, 'Contact must exist');
  const contactDetailReq = new NextRequest(`http://localhost/api/contacts/${contact.id}`);
  const contactDetailRes = await getContactById(contactDetailReq, { params: { id: contact.id } });
  const contactDetailData = await contactDetailRes.json();
  assert.strictEqual(contactDetailData.success, true);
  assert.ok(contactDetailData.contact, 'Response must have contact');
  assert.ok(Array.isArray(contactDetailData.contact.registrations), 'contact.registrations must be array');
  assert.ok(Array.isArray(contactDetailData.contact.tasks), 'contact.tasks must be array');
  assert.ok(Array.isArray(contactDetailData.contact.opportunities), 'contact.opportunities must be array');
  console.log(`✓ /api/contacts/[id] returned contact with ${contactDetailData.contact.registrations.length} registrations and ${contactDetailData.contact.tasks.length} tasks`);

  // 6. Verify Public Registration Consent Validation
  console.log('\n--- Test 6: Registration Consent Validation ---');
  const testEmail = `lead.dedup.${Date.now()}@example.com`;
  const regNoConsentReq = new NextRequest('http://localhost/api/registrations', {
    method: 'POST',
    body: JSON.stringify({
      eventId: createEventData.event.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: testEmail,
      title: 'Staff Architect',
      companyName: 'Acme Technologies',
      utmSource: 'Direct Public Portal',
      consentGiven: false,
    }),
  });
  const regNoConsentRes = await postRegistration(regNoConsentReq);
  assert.strictEqual(regNoConsentRes.status, 400, 'Must reject registration without consent from public portal');
  const regNoConsentData = await regNoConsentRes.json();
  assert.ok(regNoConsentData.error.toLowerCase().includes('consent'), 'Error must mention consent');
  console.log('✓ Public registration correctly rejected without consent');

  // 7. Verify Registration Success & Deduplication matching rule
  console.log('\n--- Test 7: CRM Registration & Deduplication ---');
  const regConsentReq = new NextRequest('http://localhost/api/registrations', {
    method: 'POST',
    body: JSON.stringify({
      eventId: createEventData.event.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: testEmail,
      title: 'Staff Architect',
      companyName: 'Acme Technologies',
      utmSource: 'Direct Public Portal',
      consentGiven: true,
    }),
  });
  const regConsentRes = await postRegistration(regConsentReq);
  const regConsentData = await regConsentRes.json();
  assert.strictEqual(regConsentRes.status, 201, 'Should succeed with consent');
  assert.strictEqual(regConsentData.success, true);

  // Check contact was created
  const createdContact = await prisma.contact.findUnique({
    where: { email: testEmail.toLowerCase() },
    include: { company: true },
  });
  assert.ok(createdContact, 'Contact should be created in DB');
  assert.strictEqual(createdContact.title, 'Staff Architect');
  assert.strictEqual(createdContact.company?.name, 'Acme Technologies');

  // Register same contact for another event with UPDATED title & company
  const secondEvent = await prisma.event.findFirst({
    where: { id: { not: createEventData.event.id } },
  });
  assert.ok(secondEvent, 'Second event must exist');

  const contactsBeforeSecondReg = await prisma.contact.count({
    where: { email: testEmail.toLowerCase() },
  });
  assert.strictEqual(contactsBeforeSecondReg, 1, 'Exactly 1 contact should exist');

  const regSecondEventReq = new NextRequest('http://localhost/api/registrations', {
    method: 'POST',
    body: JSON.stringify({
      eventId: secondEvent.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: testEmail,
      title: 'Chief Technology Officer', // Updated title
      companyName: 'Global Cloud Systems', // Updated company
      utmSource: 'Direct Public Portal',
      consentGiven: true,
    }),
  });
  const regSecondEventRes = await postRegistration(regSecondEventReq);
  const regSecondEventData = await regSecondEventRes.json();
  assert.strictEqual(regSecondEventRes.status, 201);
  assert.strictEqual(regSecondEventData.registration.contactId, createdContact.id, 'Must link to EXISTING contact');

  const contactsAfterSecondReg = await prisma.contact.count({
    where: { email: testEmail.toLowerCase() },
  });
  assert.strictEqual(contactsAfterSecondReg, 1, 'Must NOT create duplicate contact');

  // Verify contact was updated with new title and company
  const updatedContact = await prisma.contact.findUnique({
    where: { id: createdContact.id },
    include: { company: true },
  });
  assert.strictEqual(updatedContact?.title, 'Chief Technology Officer', 'Title should be updated');
  assert.strictEqual(updatedContact?.company?.name, 'Global Cloud Systems', 'Company should be updated');
  console.log('✓ Duplicate contact detection verified: linked to existing contact and updated title/company');

  // Duplicate registration for same event should return 409
  const dupRegReq = new NextRequest('http://localhost/api/registrations', {
    method: 'POST',
    body: JSON.stringify({
      eventId: secondEvent.id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: testEmail,
      consentGiven: true,
    }),
  });
  const dupRegRes = await postRegistration(dupRegReq);
  assert.strictEqual(dupRegRes.status, 409, 'Duplicate registration for same event must return 409');
  console.log('✓ 409 Conflict returned for duplicate registration to the same event');

  // 8. Verify TopNav Demo Environment Badge
  console.log('\n--- Test 8: TopNav Demo Environment Badge ---');
  const topNavSource = fs.readFileSync('/home/ubuntu/eventflow/src/components/TopNav.tsx', 'utf8');
  assert.ok(topNavSource.includes('Demo Environment'), 'TopNav must contain "Demo Environment" badge');
  console.log('✓ TopNav contains Demo Environment badge');

  console.log('\n=== ALL CORE-DEV VERIFICATIONS PASSED 100%! ===');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
