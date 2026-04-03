import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateMusic, isKieAiConfigured } from '@/lib/kieai';
import { generateStylePrompt } from '@/knowledge/music-styles';
import { MusicStyle, Mood } from '@/lib/types';
import { getSupabaseAdmin } from '@/lib/auth';

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
            'KIEAI_API_KEY environment variable is not set. Music generation is currently unavailable.',
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

    // Call Kie.ai SUNO API
    const result = await generateMusic({
      style: stylePrompt,
      lyrics: lyrics.trim(),
      model: 'V5',
    });

    // Save generation to database
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from('generations').insert({
        user_id: userId,
        type: 'music',
        style: stylePrompt || style,
        mood,
        status: 'pending',
        credits_used: 3,
        model_version: 'V5',
      });
    } catch (dbError) {
      console.error('Failed to save music generation:', dbError);
    }

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
