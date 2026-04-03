/**
 * Kie.ai Unified AI Client
 * SUNO V5/V5.5 Music Generation + Gemini 3.1 Pro Lyrics
 * Docs: https://docs.kie.ai/suno-api/generate-music
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

// ─── SUNO Music Generation (V5 / V5.5) ──────────────────

export type SunoModel = 'V5' | 'V5_5';

export interface GenerateMusicRequest {
  // Simple mode: just prompt (max 500 chars, AI generates lyrics)
  // Custom mode: prompt = exact lyrics (max 5000 chars for V5/V5.5)
  prompt?: string;
  customMode?: boolean;       // true = custom, false = simple (default)
  instrumental?: boolean;     // true = no vocals
  model?: SunoModel;          // V5 or V5_5
  // Custom mode fields:
  title?: string;             // Song title (max 80 chars)
  style?: string;             // Genre/mood (max 1000 chars for V5+)
  // Advanced controls:
  negativeTags?: string;      // Exclude genres (e.g. "Heavy Metal, Drums")
  vocalGender?: 'm' | 'f';   // Male or female voice
  styleWeight?: number;       // 0-1, adherence to style
  weirdnessConstraint?: number; // 0-1, experimental deviation
  audioWeight?: number;       // 0-1, audio feature balance
  personaId?: string;         // Custom voice profile
  callBackUrl?: string;       // Webhook URL (3 stages: text, first, complete)
}

export interface ExtendMusicRequest {
  taskId: string;
  lyrics?: string;
  style?: string;
  model?: SunoModel;
  callBackUrl?: string;
}

export interface CoverMusicRequest {
  audioUrl: string;
  style?: string;
  model?: SunoModel;
  callBackUrl?: string;
}

// API Response format (from docs)
export interface KieApiResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

// Track data in callback/status response
export interface KieTrackData {
  id: string;
  audio_url: string;
  stream_audio_url?: string;
  image_url?: string;
  prompt?: string;
  model_name?: string;
  title?: string;
  tags?: string;
  createTime?: string;
  duration?: number;
}

// Status/callback response
export interface TaskResult {
  code: number;
  msg: string;
  data: {
    callbackType?: 'text' | 'first' | 'complete';
    task_id: string;
    data: KieTrackData[];
  };
}

// Simplified response for our API routes
export interface TaskResponse {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

// ─── Generate Music ──────────────────────────────────────

export async function generateMusic(request: GenerateMusicRequest): Promise<TaskResponse> {
  const isCustom = request.customMode ?? !!request.title;

  const body: Record<string, unknown> = {
    model: request.model || 'V5',
    instrumental: request.instrumental || false,
    customMode: isCustom,
  };

  if (isCustom) {
    // Custom mode: prompt = exact lyrics, style + title required
    body.title = request.title || 'Untitled';
    body.style = request.style || 'Pop';
    if (request.prompt) body.prompt = request.prompt; // lyrics
  } else {
    // Simple mode: prompt = description (max 500 chars)
    body.prompt = request.prompt;
  }

  if (request.negativeTags) body.negativeTags = request.negativeTags;
  if (request.vocalGender) body.vocalGender = request.vocalGender;
  if (request.styleWeight !== undefined) body.styleWeight = request.styleWeight;
  if (request.weirdnessConstraint !== undefined) body.weirdnessConstraint = request.weirdnessConstraint;
  if (request.audioWeight !== undefined) body.audioWeight = request.audioWeight;
  if (request.personaId) body.personaId = request.personaId;
  if (request.callBackUrl) body.callBackUrl = request.callBackUrl;

  const res = await fetch(`${BASE_URL}/api/v1/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai generate failed: ${res.status} ${error}`);
  }

  const json: KieApiResponse = await res.json();

  if (json.code !== 200) {
    throw new Error(`Kie.ai: ${json.msg} (code ${json.code})`);
  }

  return {
    taskId: json.data.taskId,
    status: 'pending',
    message: json.msg,
  };
}

// ─── Extend Music ────────────────────────────────────────

export async function extendMusic(request: ExtendMusicRequest): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/extend`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      taskId: request.taskId,
      prompt: request.lyrics,
      style: request.style,
      model: request.model || 'V5',
      callBackUrl: request.callBackUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai extend failed: ${res.status} ${error}`);
  }

  const json: KieApiResponse = await res.json();
  return { taskId: json.data.taskId, status: 'pending', message: json.msg };
}

// ─── Cover Audio ─────────────────────────────────────────

export async function coverMusic(request: CoverMusicRequest): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/cover`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      audioUrl: request.audioUrl,
      style: request.style,
      model: request.model || 'V5',
      callBackUrl: request.callBackUrl,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai cover failed: ${res.status} ${error}`);
  }

  const json: KieApiResponse = await res.json();
  return { taskId: json.data.taskId, status: 'pending', message: json.msg };
}

// ─── Check Task Status ───────────────────────────────────

export async function checkTaskStatus(taskId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  tracks: KieTrackData[];
  error?: string;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/status?taskId=${taskId}`, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kie.ai status check failed: ${res.status} ${error}`);
  }

  const json = await res.json();

  // Map Kie.ai response to our format
  const tracks: KieTrackData[] = json.data?.data || [];
  let status: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';

  if (json.code === 200 && tracks.length > 0 && tracks[0].audio_url) {
    status = 'completed';
  } else if (json.code === 501) {
    status = 'failed';
  } else if (json.code === 200) {
    status = 'processing';
  }

  return {
    status,
    tracks,
    error: json.code !== 200 ? json.msg : undefined,
  };
}

// Poll until completion (max 5 minutes)
export async function waitForCompletion(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<KieTrackData[]> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkTaskStatus(taskId);

    if (result.status === 'completed') return result.tracks;
    if (result.status === 'failed') throw new Error(result.error || 'Generation failed');

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Generation timed out after 5 minutes');
}

// ─── Separate Vocals ─────────────────────────────────────

export async function separateVocals(audioUrl: string): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/separate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ audioUrl }),
  });

  if (!res.ok) throw new Error(`Kie.ai separate failed: ${res.status}`);
  const json: KieApiResponse = await res.json();
  return { taskId: json.data.taskId, status: 'pending' };
}

// ─── Create Music Video ──────────────────────────────────

export async function createMusicVideo(taskId: string): Promise<TaskResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/video`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ taskId }),
  });

  if (!res.ok) throw new Error(`Kie.ai video failed: ${res.status}`);
  const json: KieApiResponse = await res.json();
  return { taskId: json.data.taskId, status: 'pending' };
}

// ─── Gemini 3.1 Pro (Lyrics Generation) ──────────────────

export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
