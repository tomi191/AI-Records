/**
 * Kie.ai Unified AI Client
 * Single provider for SUNO Music Generation + Gemini 3.1 Pro Lyrics
 * Docs: https://docs.kie.ai
 */

const BASE_URL = process.env.KIEAI_BASE_URL || 'https://api.kie.ai';

function getApiKey(): string {
  const key = process.env.KIEAI_API_KEY;
  if (!key) throw new Error('KIEAI_API_KEY is not configured');
  return key;
}

function headers(): Record<string, string> {
  return {
    'Authorization': `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  };
}

export function isKieAiConfigured(): boolean {
  return !!process.env.KIEAI_API_KEY;
}

// ─── SUNO Music Generation ───────────────────────────────

export type SunoModel = 'V5';

export interface GenerateMusicRequest {
  prompt?: string;          // Simple mode: text prompt (max 500-1000 chars)
  title?: string;           // Custom mode: song title
  style?: string;           // Custom mode: style description
  lyrics?: string;          // Custom mode: lyrics (max 5000 chars)
  model?: SunoModel;        // Default: V5
  instrumental?: boolean;   // Instrumental only
  vocalGender?: 'male' | 'female';
  callbackUrl?: string;     // Webhook on completion
}

export interface ExtendMusicRequest {
  taskId: string;           // Original task to extend
  lyrics?: string;          // Lyrics for extension
  style?: string;           // Style for extension
  model?: SunoModel;
  callbackUrl?: string;
}

export interface CoverMusicRequest {
  audioUrl: string;         // Source audio URL
  style?: string;           // New style
  model?: SunoModel;
  callbackUrl?: string;
}

export interface TaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface TaskResult {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  audio_urls?: string[];    // Multiple variations
  duration?: number;
  title?: string;
  lyrics?: string;
  error?: string;
}

// Generate music (returns task_id for polling)
export async function generateMusic(request: GenerateMusicRequest): Promise<TaskResponse> {
  const body: Record<string, unknown> = {
    model: request.model || 'V5',
    instrumental: request.instrumental || false,
  };

  if (request.prompt) {
    // Simple mode
    body.prompt = request.prompt;
  } else {
    // Custom mode
    body.title = request.title;
    body.style = request.style;
    body.lyrics = request.lyrics;
  }

  if (request.vocalGender) body.vocalGender = request.vocalGender;
  if (request.callbackUrl) body.callbackUrl = request.callbackUrl;

  const res = await fetch(`${BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai generate failed: ${res.status} ${error}`);
  }

  return res.json();
}

// Extend an existing song
export async function extendMusic(request: ExtendMusicRequest): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/extend`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      taskId: request.taskId,
      lyrics: request.lyrics,
      style: request.style,
      model: request.model || 'V5',
      callbackUrl: request.callbackUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai extend failed: ${res.status} ${error}`);
  }

  return res.json();
}

// Create a cover (change style of existing audio)
export async function coverMusic(request: CoverMusicRequest): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/cover`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      audioUrl: request.audioUrl,
      style: request.style,
      model: request.model || 'V5',
      callbackUrl: request.callbackUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai cover failed: ${res.status} ${error}`);
  }

  return res.json();
}

// Check task status (poll for completion)
export async function checkTaskStatus(taskId: string): Promise<TaskResult> {
  const res = await fetch(`${BASE_URL}/api/v1/status?taskId=${taskId}`, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai status check failed: ${res.status} ${error}`);
  }

  return res.json();
}

// Poll until completion (max 5 minutes)
export async function waitForCompletion(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<TaskResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkTaskStatus(taskId);

    if (result.status === 'completed') return result;
    if (result.status === 'failed') throw new Error(result.error || 'Generation failed');

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Generation timed out after 5 minutes');
}

// Separate vocals from audio
export async function separateVocals(audioUrl: string): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/separate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ audioUrl }),
  });

  if (!res.ok) throw new Error(`Kie.ai separate failed: ${res.status}`);
  return res.json();
}

// Create music video
export async function createMusicVideo(taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/video`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ taskId }),
  });

  if (!res.ok) throw new Error(`Kie.ai video failed: ${res.status}`);
  return res.json();
}

// ─── Gemini 3.1 Pro (Lyrics Generation) ──────────────────

export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiCompletionRequest {
  messages: GeminiMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Generate lyrics with Gemini 3.1 Pro (streaming)
export async function generateLyricsStream(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'gemini-3.1-pro-openai',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini generation failed: ${res.status} ${error}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          fullText += content;
          onChunk(content);
        }
      } catch {
        // Skip malformed chunks
      }
    }
  }

  return fullText;
}

// Generate lyrics without streaming
export async function generateLyrics(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: 'gemini-3.1-pro-openai',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      stream: false,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini generation failed: ${res.status} ${error}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
