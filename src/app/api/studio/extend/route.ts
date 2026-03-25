import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { extendMusic, isKieAiConfigured, type SunoModel } from '@/lib/kieai';

const VALID_MODELS: SunoModel[] = ['V3_5', 'V4', 'V4_5', 'V4_5PLUS', 'V5'];

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
    const { taskId, lyrics, style, model } = body;

    // Validate required fields
    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Validate model if provided
    const selectedModel: SunoModel = model && VALID_MODELS.includes(model) ? model : 'V5';

    // Call Kie.ai extend API
    const result = await extendMusic({
      taskId: taskId.trim(),
      lyrics: lyrics?.trim() || undefined,
      style: style?.trim() || undefined,
      model: selectedModel,
    });

    return NextResponse.json({
      task_id: result.task_id,
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
