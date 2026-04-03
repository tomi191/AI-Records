import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extendMusic, isKieAiConfigured } from '@/lib/kieai';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Kie.ai is configured
    if (!isKieAiConfigured()) {
      return NextResponse.json(
        {
          error: 'Music API not configured',
          message:
            'KIEAI_API_KEY environment variable is not set. Extend functionality is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { taskId, lyrics, style } = body;

    // Validate required fields
    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Call Kie.ai extend API
    const result = await extendMusic({
      taskId: taskId.trim(),
      lyrics: lyrics?.trim() || undefined,
      style: style?.trim() || undefined,
      model: 'V5',
    });

    return NextResponse.json({
      task_id: result.taskId,
      status: result.status,
      message: 'Extend started',
    });
  } catch (error) {
    console.error('Extend Error:', error);
    return NextResponse.json(
      {
        error: 'Extend failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
