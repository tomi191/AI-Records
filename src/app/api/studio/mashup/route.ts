import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateMusic, isKieAiConfigured } from '@/lib/kieai';

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
          message: 'KIEAI_API_KEY environment variable is not set. Mashup generation is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { audioUrls, style } = body;

    // Validate required fields
    if (!Array.isArray(audioUrls) || audioUrls.length < 2) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'At least 2 audio URLs are required' },
        { status: 400 }
      );
    }

    // Validate all URLs are strings
    for (const url of audioUrls) {
      if (!url || typeof url !== 'string' || url.trim().length === 0) {
        return NextResponse.json(
          { error: 'Invalid request', message: 'All audio URLs must be valid strings' },
          { status: 400 }
        );
      }
    }

    // Build mashup prompt combining sources
    const sourceList = audioUrls.map((url: string, i: number) => `Source ${i + 1}: ${url.trim()}`).join('\n');
    const mashupPrompt = `Create a mashup combining the following audio sources:\n${sourceList}${style ? `\nStyle: ${style}` : ''}`;

    // Call Kie.ai Generate API with mashup prompt
    const result = await generateMusic({
      prompt: mashupPrompt,
      model: 'V5',
      style: style || undefined,
    });

    return NextResponse.json({
      task_id: result.task_id,
      status: result.status,
      message: 'Mashup generation started',
    });
  } catch (error) {
    console.error('Mashup Generate Error:', error);
    return NextResponse.json(
      {
        error: 'Mashup generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
