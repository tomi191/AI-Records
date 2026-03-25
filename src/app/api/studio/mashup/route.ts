import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateMusic, isKieAiConfigured, SunoModel } from '@/lib/kieai';

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
          message: 'KIEAI_API_KEY environment variable is not set. Mashup generation is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { audioUrls, style, model } = body;

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

    // Validate model if provided
    const selectedModel: SunoModel = model && VALID_MODELS.includes(model) ? model : 'V5';

    // Build mashup prompt combining sources
    const sourceList = audioUrls.map((url: string, i: number) => `Source ${i + 1}: ${url.trim()}`).join('\n');
    const mashupPrompt = `Create a mashup combining the following audio sources:\n${sourceList}${style ? `\nStyle: ${style}` : ''}`;

    // Call Kie.ai Generate API with mashup prompt
    const result = await generateMusic({
      prompt: mashupPrompt,
      model: selectedModel,
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
