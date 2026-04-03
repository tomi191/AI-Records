import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { coverMusic, isKieAiConfigured } from '@/lib/kieai';

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
          message: 'KIEAI_API_KEY environment variable is not set. Cover generation is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { audioUrl, style } = body;

    // Validate required fields
    if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Audio URL is required' },
        { status: 400 }
      );
    }

    // Call Kie.ai Cover API
    const result = await coverMusic({
      audioUrl: audioUrl.trim(),
      style: style || undefined,
      model: 'V5',
    });

    return NextResponse.json({
      task_id: result.taskId,
      status: result.status,
      message: 'Cover generation started',
    });
  } catch (error) {
    console.error('Cover Generate Error:', error);
    return NextResponse.json(
      {
        error: 'Cover generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
