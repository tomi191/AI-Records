// SUNO API Integration via SunoAPI.org
// This is a third-party API service for SUNO music generation

const SUNO_API = process.env.SUNO_API_URL || 'https://api.sunoapi.org/api/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

export interface SunoGenerateRequest {
  prompt: string;
  lyrics?: string;
  model?: 'chirp-v3' | 'chirp-v3.5' | 'chirp-v4';
  make_instrumental?: boolean;
}

export interface SunoGenerateResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface SunoStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url?: string;
  duration?: number;
  title?: string;
  error?: string;
}

// Check if SUNO API is configured
export function isSunoConfigured(): boolean {
  return !!SUNO_API_KEY;
}

// Generate music with SUNO
export async function generateMusic(
  request: SunoGenerateRequest
): Promise<SunoGenerateResponse> {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO API key not configured');
  }

  const response = await fetch(`${SUNO_API}/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: request.prompt,
      lyrics: request.lyrics,
      model: request.model || 'chirp-v3.5',
      make_instrumental: request.make_instrumental || false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `SUNO API error: ${response.status}`);
  }

  return response.json();
}

// Check generation status
export async function checkStatus(taskId: string): Promise<SunoStatusResponse> {
  if (!SUNO_API_KEY) {
    throw new Error('SUNO API key not configured');
  }

  const response = await fetch(`${SUNO_API}/status/${taskId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `SUNO API error: ${response.status}`);
  }

  return response.json();
}

// Helper to poll for completion
export async function waitForCompletion(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<SunoStatusResponse> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkStatus(taskId);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Generation failed');
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Generation timed out');
}
