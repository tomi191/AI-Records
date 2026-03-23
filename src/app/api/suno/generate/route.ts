import { NextRequest, NextResponse } from 'next/server';
import { generateMusic, isSunoConfigured } from '@/lib/suno';
import { generateStylePrompt } from '@/knowledge/music-styles';
import { MusicStyle, Mood } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check if SUNO is configured
    if (!isSunoConfigured()) {
      return NextResponse.json(
        {
          error: 'SUNO API not configured',
          message:
            'SUNO_API_KEY environment variable is not set. Music generation is currently unavailable.',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { style, mood, lyrics, customPrompt } = body;

    // Validate required fields
    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Lyrics are required' },
        { status: 400 }
      );
    }

    // Generate style prompt
    let stylePrompt = '';
    if (style && mood) {
      stylePrompt = generateStylePrompt(style as MusicStyle, mood as Mood);
    }

    // Add custom prompt if provided
    if (customPrompt && typeof customPrompt === 'string') {
      stylePrompt = stylePrompt
        ? `${stylePrompt}, ${customPrompt}`
        : customPrompt;
    }

    // Call SUNO API
    const result = await generateMusic({
      prompt: stylePrompt,
      lyrics: lyrics.trim(),
      model: 'chirp-v3.5',
    });

    return NextResponse.json({
      task_id: result.task_id,
      status: result.status,
      message: 'Generation started',
    });
  } catch (error) {
    console.error('SUNO Generate Error:', error);
    return NextResponse.json(
      {
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
