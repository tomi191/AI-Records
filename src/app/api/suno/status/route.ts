import { NextRequest, NextResponse } from 'next/server';
import { checkStatus, isSunoConfigured } from '@/lib/suno';

export async function GET(request: NextRequest) {
  try {
    // Check if SUNO is configured
    if (!isSunoConfigured()) {
      return NextResponse.json(
        {
          error: 'SUNO API not configured',
          message: 'SUNO_API_KEY environment variable is not set.',
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

    const status = await checkStatus(taskId);

    return NextResponse.json({
      task_id: status.task_id,
      status: status.status,
      audio_url: status.audio_url,
      duration: status.duration,
      title: status.title,
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
