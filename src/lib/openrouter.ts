import OpenAI from 'openai';

// OpenRouter client configured for Gemini 3 Flash
export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'AI-Records Bulgarian Lyrics Generator',
  },
});

// Model to use
export const MODEL = 'google/gemini-2.0-flash-001';

// Check if API key is configured
export function isConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

// Generate completion with streaming
export async function generateStreamingCompletion(
  systemPrompt: string,
  userPrompt: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!isConfigured()) {
    throw new Error('OpenRouter API key is not configured');
  }

  const stream = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.8,
    max_tokens: 4096,
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    if (onChunk) {
      onChunk(content);
    }
  }

  return fullResponse;
}

// Generate completion without streaming
export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!isConfigured()) {
    throw new Error('OpenRouter API key is not configured');
  }

  const response = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}
