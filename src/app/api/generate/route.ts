import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { openrouter, MODEL, isConfigured } from '@/lib/openrouter';
import { buildSystemPrompt, buildUserPrompt, generateSunoStylePrompt, extractStructure } from '@/lib/lyricsGenerator';
import { GenerationRequest, MusicStyle, Mood } from '@/lib/types';

// Validate request body
function validateRequest(body: unknown): body is GenerationRequest {
  if (!body || typeof body !== 'object') return false;

  const req = body as Record<string, unknown>;

  const validStyles: MusicStyle[] = ['pop', 'rock', 'hip-hop', 'electronic', 'rnb', 'chalga', 'folk', 'ballad'];
  const validMoods: Mood[] = ['happy', 'sad', 'romantic', 'energetic', 'aggressive', 'melancholic', 'hopeful', 'nostalgic'];

  return (
    typeof req.style === 'string' &&
    validStyles.includes(req.style as MusicStyle) &&
    typeof req.mood === 'string' &&
    validMoods.includes(req.mood as Mood) &&
    typeof req.topic === 'string' &&
    req.topic.length > 0 &&
    req.topic.length <= 500
  );
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API is configured
    if (!isConfigured()) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured',
          message: 'Please set OPENROUTER_API_KEY in your environment variables',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    if (!validateRequest(body)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Please provide valid style, mood, and topic',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { style, mood, topic } = body;

    // Build prompts
    const systemPrompt = buildSystemPrompt(style, mood);
    const userPrompt = buildUserPrompt({ style, mood, topic });

    // Generate SUNO style prompt
    const stylePrompt = generateSunoStylePrompt(style, mood);

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'meta', stylePrompt })}\n\n`
            )
          );

          // Create OpenRouter stream
          const completion = await openrouter.chat.completions.create({
            model: MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            stream: true,
            temperature: 0.8,
            max_tokens: 4096,
          });

          let fullLyrics = '';

          // Stream chunks
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullLyrics += content;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'chunk', content })}\n\n`
                )
              );
            }
          }

          // Send completion with structure
          const structure = extractStructure(fullLyrics);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'complete',
                lyrics: fullLyrics,
                structure,
                metadata: {
                  style,
                  mood,
                  topic,
                  generatedAt: new Date().toISOString(),
                },
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: error instanceof Error ? error.message : 'Generation failed',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
