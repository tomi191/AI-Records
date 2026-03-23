'use client';

import { useState } from 'react';
import { MusicStyle, Mood } from '@/lib/types';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import {
  StyleSelector,
  MoodSelector,
  CreditDisplay,
} from '@/components/studio';
import { Card, Button, Textarea, Badge } from '@/components/ui';
import {
  Wand2,
  Music,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Download,
  RefreshCw,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'failed';

export default function MusicGeneratorPage() {
  const { user, deductCredits } = useUserStore();

  // State
  const [style, setStyle] = useState<MusicStyle>('chalga');
  const [mood, setMood] = useState<Mood>('romantic');
  const [lyrics, setLyrics] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const hasEnoughCredits = (user?.credits || 0) >= CREDIT_COSTS.music;

  // Generate music
  const handleGenerate = async () => {
    if (!lyrics.trim() || status === 'generating' || status === 'processing') return;
    if (!hasEnoughCredits) return;

    setStatus('generating');
    setError(null);
    setAudioUrl(null);
    setTaskId(null);

    try {
      const response = await fetch('/api/suno/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style,
          mood,
          lyrics,
          customPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setTaskId(data.task_id);
      setStatus('processing');

      // Start polling for status
      pollStatus(data.task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('failed');
    }
  };

  // Poll for generation status
  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    const interval = 5000;

    const poll = async () => {
      try {
        const response = await fetch(`/api/suno/status?taskId=${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setAudioUrl(data.audio_url);
          setStatus('completed');
          deductCredits(CREDIT_COSTS.music);
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Generation failed');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          throw new Error('Generation timed out');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Status check failed');
        setStatus('failed');
      }
    };

    poll();
  };

  // Reset form
  const handleReset = () => {
    setStatus('idle');
    setTaskId(null);
    setAudioUrl(null);
    setError(null);
    setLyrics('');
    setCustomPrompt('');
  };

  const isGenerating = status === 'generating' || status === 'processing';

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">Генератор на Музика</h1>
            <Badge variant="cyan">Ново</Badge>
          </div>
          <p className="text-gray-400">
            Превърни текстовете си в пълноценни песни
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Style & Mood */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <Card variant="glass" padding="md">
              <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
            </Card>
            <Card variant="glass" padding="md">
              <MoodSelector selectedMood={mood} onMoodChange={setMood} />
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Credit Display */}
            <CreditDisplay type="music" />

            {/* Lyrics Input */}
            <Card variant="glass" padding="md">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Текст на песента
                </h3>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder={`Постави текста тук с метатагове...

[Verse]
В нощта се губя сам
в спомени от теб

[Chorus]
Копнея за теб...`}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
            </Card>

            {/* Custom Style Prompt */}
            <Card variant="glass" padding="md">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Допълнителни Инструкции (по избор)
                </h3>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Добави допълнителни стилови инструкции (напр. 'Женски вокал, 120 BPM, Модерна продукция')"
                  className="min-h-[80px]"
                  disabled={isGenerating}
                />
              </div>
            </Card>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Generation Status */}
            {isGenerating && (
              <Card variant="gradient" padding="lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-xl">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {status === 'generating' ? 'Изпращане на заявка...' : 'Генериране на песента...'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Обикновено отнема 1-3 минути. Моля, изчакай.
                    </p>
                  </div>
                </div>
                {taskId && (
                  <p className="mt-4 text-xs text-gray-500">
                    ID на задачата: {taskId}
                  </p>
                )}
              </Card>
            )}

            {/* Audio Player */}
            {status === 'completed' && audioUrl && (
              <Card variant="gradient" padding="lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Music className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Песента е Готова!</p>
                    <p className="text-sm text-gray-400">
                      Можеш да я слушаш и изтеглиш
                    </p>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="p-4 bg-black/20 rounded-xl space-y-4">
                  <audio
                    src={audioUrl}
                    controls
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <a
                    href={audioUrl}
                    download
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                      Изтегли MP3
                    </Button>
                  </a>
                  <Button
                    variant="secondary"
                    onClick={handleReset}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Генерирай Друга
                  </Button>
                </div>
              </Card>
            )}

            {/* Generate Button */}
            {status === 'idle' && (
              <Button
                onClick={handleGenerate}
                disabled={!lyrics.trim() || !hasEnoughCredits}
                isLoading={isGenerating}
                leftIcon={<Wand2 className="w-5 h-5" />}
                className="w-full"
                size="lg"
              >
                Генерирай Музика (3 Кредита)
              </Button>
            )}

            {status === 'failed' && (
              <Button
                onClick={handleReset}
                variant="secondary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full"
                size="lg"
              >
                Опитай Отново
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
