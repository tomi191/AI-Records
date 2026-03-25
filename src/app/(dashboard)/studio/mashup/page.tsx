'use client';

import { useState } from 'react';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import { Card, Button, Input, Select } from '@/components/ui';
import {
  Layers,
  AlertCircle,
  Loader2,
  Music,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Link,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'failed';

const MODEL_OPTIONS = [
  { value: 'V3_5', label: 'Suno V3.5' },
  { value: 'V4', label: 'Suno V4' },
  { value: 'V4_5', label: 'Suno V4.5' },
  { value: 'V4_5PLUS', label: 'Suno V4.5+' },
  { value: 'V5', label: 'Suno V5' },
];

export default function MashupPage() {
  const { user, deductCredits } = useUserStore();

  // Form state
  const [audioUrls, setAudioUrls] = useState<string[]>(['', '']);
  const [style, setStyle] = useState('');
  const [model, setModel] = useState('V5');

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughCredits = (user?.credits || 0) >= CREDIT_COSTS.mashup;
  const isGenerating = status === 'generating' || status === 'processing';
  const validUrls = audioUrls.filter((url) => url.trim().length > 0);
  const canGenerate = validUrls.length >= 2 && hasEnoughCredits && !isGenerating;

  // Manage audio URL list
  const updateUrl = (index: number, value: string) => {
    const updated = [...audioUrls];
    updated[index] = value;
    setAudioUrls(updated);
  };

  const addUrl = () => {
    if (audioUrls.length < 5) {
      setAudioUrls([...audioUrls, '']);
    }
  };

  const removeUrl = (index: number) => {
    if (audioUrls.length > 2) {
      setAudioUrls(audioUrls.filter((_, i) => i !== index));
    }
  };

  // Generate mashup
  const handleGenerate = async () => {
    if (!canGenerate) return;

    setStatus('generating');
    setError(null);
    setAudioResult(null);
    setTaskId(null);

    try {
      const response = await fetch('/api/studio/mashup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrls: validUrls,
          style: style.trim() || undefined,
          model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setTaskId(data.task_id);
      setStatus('processing');
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
          setAudioResult(data.audio_url);
          setStatus('completed');
          deductCredits(CREDIT_COSTS.mashup);
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
    setAudioResult(null);
    setError(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl">
              <Layers className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mashup — Комбинирай Песни</h1>
              <p className="text-gray-400">
                Обедини две или повече песни в уникален микс
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio Sources */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Аудио Източници (мин. 2)
              </h3>

              {audioUrls.map((url, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder={`https://example.com/song-${index + 1}.mp3`}
                      label={`Песен ${index + 1}`}
                      leftIcon={<Link className="w-4 h-4" />}
                      disabled={isGenerating}
                    />
                  </div>
                  {audioUrls.length > 2 && (
                    <button
                      onClick={() => removeUrl(index)}
                      disabled={isGenerating}
                      className="p-2.5 mb-0.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Премахни"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {audioUrls.length < 5 && (
                <button
                  onClick={addUrl}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Добави Песен
                </button>
              )}
            </div>
          </Card>

          {/* Style & Model */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Стил на Миксa
              </h3>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="напр. Smooth transition, EDM remix, Chill mashup..."
                label="Как да се комбинират (по избор)"
                disabled={isGenerating}
              />
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={MODEL_OPTIONS}
                label="Модел"
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
                    {status === 'generating' ? 'Изпращане на заявка...' : 'Генериране на mashup...'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Обикновено отнема 2-5 минути. Моля, изчакай.
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

          {/* Audio Player - Completed */}
          {status === 'completed' && audioResult && (
            <Card variant="gradient" padding="lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Mashup-ът е Готов!</p>
                  <p className="text-sm text-gray-400">
                    Можеш да го слушаш и изтеглиш
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-xl">
                <audio src={audioResult} controls className="w-full" />
              </div>

              <div className="flex gap-3 mt-6">
                <a href={audioResult} download className="flex-1">
                  <Button variant="primary" className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                    Изтегли MP3
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Нов Mashup
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {status === 'idle' && (
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              isLoading={isGenerating}
              leftIcon={<Layers className="w-5 h-5" />}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              size="lg"
            >
              Генерирай Mashup ({CREDIT_COSTS.mashup} Кредита)
            </Button>
          )}

          {!hasEnoughCredits && status === 'idle' && (
            <p className="text-center text-sm text-red-400">
              Нямаш достатъчно кредити. Нужни са {CREDIT_COSTS.mashup} кредита.
            </p>
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
  );
}
