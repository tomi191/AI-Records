import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkTaskStatus, isKieAiConfigured } from '@/lib/kieai';

export async function GET(request: NextRequest) {
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
          message: 'KIEAI_API_KEY environment variable is not set.',
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Task ID is required' },
        { status: 400 }
      );
    }

    const status = await checkTaskStatus(taskId);

    const firstTrack = status.tracks?.[0];

    return NextResponse.json({
      task_id: taskId,
      status: status.status,
      audio_url: firstTrack?.audio_url,
      image_url: firstTrack?.image_url,
      duration: firstTrack?.duration,
      title: firstTrack?.title,
      tracks: status.tracks,
      error: status.error,
    });
  } catch (error) {
    console.error('SUNO Status Error:', error);
    return NextResponse.json(
      {
        error: 'Status check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
