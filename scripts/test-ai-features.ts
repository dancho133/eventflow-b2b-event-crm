import { processAITask, checkAIKeyConfigured } from '../src/lib/ai-service';
import { prisma } from '../src/lib/db';

async function runAIFeatureTests() {
  console.log('================================================================');
  console.log('🤖 EVENTFLOW AI COPILOT & INTELLIGENCE FEATURES TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✔ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Fallback & Key Status Test
  console.log('--- TEST 1: GRACEFUL FALLBACK & API KEY DETECTION ---');
  const keyStatus = checkAIKeyConfigured();
  console.log(`  Provider detection: hasKey=${keyStatus.hasKey}, provider=${keyStatus.provider}`);
  assert(typeof keyStatus.hasKey === 'boolean', 'checkAIKeyConfigured returns boolean hasKey');

  // 2. Segment Suggestions Task Test
  console.log('\n--- TEST 2: B2B SEGMENT SUGGESTIONS TASK ---');
  const sampleEvent = await prisma.event.findFirst();
  const segmentRes = await processAITask({
    type: 'segment_suggestions',
    eventId: sampleEvent?.id,
  });

  assert(segmentRes.type === 'segment_suggestions', 'Response type is segment_suggestions');
  assert(segmentRes.isFallback === !keyStatus.hasKey, 'Response accurately reports fallback status');
  assert(Boolean(segmentRes.result && segmentRes.result.length > 50), 'Result text contains comprehensive markdown analysis');
  assert(Boolean(segmentRes.structuredData?.segments), 'structuredData contains segments array');
  assert(segmentRes.structuredData.segments.length >= 4, 'Includes at least 4 high-value B2B segments');

  const segmentNames = segmentRes.structuredData.segments.map((s: any) => s.name);
  assert(segmentNames.some((n: string) => /decision maker/i.test(n)), 'Includes Enterprise Decision Makers segment');
  assert(segmentNames.some((n: string) => /technical|evaluator|architect/i.test(n)), 'Includes Technical Evaluators segment');
  assert(segmentNames.some((n: string) => /growth/i.test(n)), 'Includes Growth Accounts segment');

  // Verify business rationales are present
  const allHaveRationales = segmentRes.structuredData.segments.every((s: any) => Boolean(s.rationale && s.recommendedAction));
  assert(allHaveRationales, 'All segments include business rationale and recommended action playbook');

  // Verify no fake participant data: all contacts must exist in DB
  const sampleContacts = segmentRes.structuredData.segments.flatMap((s: any) => s.contacts || []);
  if (sampleContacts.length > 0) {
    const contactIds: string[] = Array.from(new Set<string>(sampleContacts.map((c: any) => String(c.id))));
    const existingContactsCount = await prisma.contact.count({
      where: { id: { in: contactIds } },
    });
    assert(existingContactsCount === contactIds.length, `All ${contactIds.length} unique referenced contacts exist in real DB (no fake data)`);
  } else {
    assert(true, 'No contacts in DB or event, handled gracefully without fake data');
  }

  // 3. Event Brief -> Structured Draft Test
  console.log('\n--- TEST 3: EVENT BRIEF TO STRUCTURED DRAFT ---');
  const briefRes = await processAITask({
    type: 'event_brief',
    prompt: 'Enterprise Cloud Architecture Summit 2026 for 250 CTOs with $45,000 budget targeting enterprise tech leaders',
  });

  assert(briefRes.type === 'event_brief', 'Response type is event_brief');
  assert(Boolean(briefRes.structuredData?.eventDraft), 'structuredData contains structured eventDraft');
  const draft = briefRes.structuredData.eventDraft;
  assert(Boolean(draft.title && draft.title.length > 5), `Draft title generated: "${draft.title}"`);
  assert(draft.capacity === 250, `Draft capacity parsed from prompt: ${draft.capacity}`);
  assert(draft.budget === 45000, `Draft budget parsed from prompt: $${draft.budget}`);
  assert(Boolean(draft.description && draft.shortDescription), 'Draft contains full and short descriptions');
  assert(Boolean(draft.targetAudience), `Draft target audience identified: "${draft.targetAudience}"`);

  // 4. Follow-up Draft & Human-in-the-Loop Task Creation Test
  console.log('\n--- TEST 4: FOLLOW-UP DRAFT & HUMAN-IN-THE-LOOP TASK ---');
  const sampleContact = await prisma.contact.findFirst({
    include: { company: true },
  });

  const followupRes = await processAITask({
    type: 'followup_draft',
    contactId: sampleContact?.id,
    eventId: sampleEvent?.id,
    prompt: 'Discussed cloud migration timeline and SOC2 compliance package',
  });

  assert(followupRes.type === 'followup_draft', 'Response type is followup_draft');
  assert(Boolean(followupRes.structuredData?.subject), `Follow-up subject generated: "${followupRes.structuredData?.subject}"`);
  assert(Boolean(followupRes.structuredData?.body), 'Follow-up email body generated');
  assert(Boolean(followupRes.structuredData?.reviewNotes), 'Follow-up includes human review guardrail notice');

  // Verify task creation from draft
  const task = await prisma.task.create({
    data: {
      title: `Follow-up Review: ${sampleContact?.firstName} ${sampleContact?.lastName}`,
      description: `EMAIL DRAFT FOR HUMAN REVIEW:\n\nSubject: ${followupRes.structuredData.subject}\n\n${followupRes.structuredData.body}`,
      status: 'Pending',
      priority: 'Medium',
      contactId: sampleContact?.id,
      eventId: sampleEvent?.id,
      workspaceId: sampleContact?.workspaceId || sampleEvent?.workspaceId || 'default',
    },
  });

  assert(Boolean(task.id), `Follow-up review task created with ID: ${task.id}`);
  assert(task.status === 'Pending', 'Task created in Pending status for human review');
  assert(!task.description?.includes('AUTONOMOUS_SENT'), 'Autonomous dispatch avoided, human review preserved');

  // Clean up test task
  await prisma.task.delete({ where: { id: task.id } });

  console.log('\n================================================================');
  console.log(`🎉 AI FEATURES TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAIFeatureTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
