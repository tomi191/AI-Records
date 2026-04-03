import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { separateVocals, generateMusic, isKieAiConfigured } from '@/lib/kieai';

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
    const { audioUrl, action } = body;

    if (!audioUrl || typeof audioUrl !== 'string' || audioUrl.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Audio URL is required' },
        { status: 400 }
      );
    }

    const validActions = ['separate', 'add_vocals', 'add_instrumental'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Valid action is required: separate, add_vocals, or add_instrumental' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'separate') {
      result = await separateVocals(audioUrl.trim());
    } else if (action === 'add_vocals') {
      result = await generateMusic({
        prompt: `Add vocals to this instrumental track: ${audioUrl.trim()}`,
        model: 'V5',
      });
    } else {
      // add_instrumental
      result = await generateMusic({
        prompt: `Add instrumental backing to this vocal track: ${audioUrl.trim()}`,
        model: 'V5',
        instrumental: true,
      });
    }

    return NextResponse.json({
      task_id: result.taskId,
      status: result.status,
      message: action === 'separate' ? 'Vocal separation started' : 'Generation started',
    });
  } catch (error) {
    console.error('Vocals Error:', error);
    return NextResponse.json(
      {
        error: 'Vocals processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
