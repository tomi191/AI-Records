import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createMusicVideo, isKieAiConfigured } from '@/lib/kieai';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isKieAiConfigured()) {
      return NextResponse.json(
        {
          error: 'Music API not configured',
          message: 'KIEAI_API_KEY environment variable is not set.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId || typeof taskId !== 'string' || taskId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const result = await createMusicVideo(taskId.trim());

    return NextResponse.json({
      task_id: result.taskId,
      status: result.status,
      message: 'Video generation started',
    });
  } catch (error) {
    console.error('Video Error:', error);
    return NextResponse.json(
      {
        error: 'Video generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
