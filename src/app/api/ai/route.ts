import { NextRequest, NextResponse } from 'next/server';
import { processAITask } from '@/lib/ai-service';
import { AITaskType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, eventId, contactId, prompt, context } = body;

    const validTypes: AITaskType[] = [
      'event_brief',
      'followup_draft',
      'meeting_notes',
      'lead_classification',
      'operational_query',
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid AI task type: "${type}". Expected one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const aiResponse = await processAITask({
      type,
      eventId,
      contactId,
      prompt,
      context,
    });

    return NextResponse.json({
      success: true,
      ...aiResponse,
    });
  } catch (error: any) {
    console.error('Error running AI assistant task:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
