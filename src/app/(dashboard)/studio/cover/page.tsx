'use client';

import { useState, useRef } from 'react';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import { Card, Button, Input } from '@/components/ui';
import {
  Disc3,
  AlertCircle,
  Loader2,
  Music,
  Download,
  RefreshCw,
  Upload,
  Link,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'failed';

type AudioSource = 'url' | 'upload';

export default function CoverPage() {
  const { user, deductCredits } = useUserStore();

  // Form state
  const [audioSource, setAudioSource] = useState<AudioSource>('url');
  const [audioUrl, setAudioUrl] = useState('');
  const [style, setStyle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasEnoughCredits = (user?.credits || 0) >= CREDIT_COSTS.cover;
  const isGenerating = status === 'generating' || status === 'processing';

  // Handle file upload to R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setAudioUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Generate cover
  const handleGenerate = async () => {
    if (!audioUrl.trim() || isGenerating) return;
    if (!hasEnoughCredits) return;

    setStatus('generating');
    setError(null);
    setAudioResult(null);
    setTaskId(null);

    try {
      const response = await fetch('/api/studio/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: audioUrl.trim(),
          style: style.trim() || undefined,
          model: 'V5',
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
          deductCredits(CREDIT_COSTS.cover);
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
            <div className="p-2.5 bg-purple-500/20 rounded-xl">
              <Disc3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Cover — Промени Стила</h1>
              <p className="text-gray-400">
                Трансформирай съществуваща песен в нов жанр или стил
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Audio Source */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Аудио Източник
              </h3>

              {/* Source toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAudioSource('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    audioSource === 'url'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                  }`}
                  disabled={isGenerating}
                >
                  <Link className="w-4 h-4" />
                  URL Линк
                </button>
                <button
                  onClick={() => setAudioSource('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    audioSource === 'upload'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600'
                  }`}
                  disabled={isGenerating}
                >
                  <Upload className="w-4 h-4" />
                  Качи Файл
                </button>
              </div>

              {/* URL input */}
              {audioSource === 'url' && (
                <Input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/song.mp3"
                  label="URL на аудио файла"
                  leftIcon={<Link className="w-4 h-4" />}
                  disabled={isGenerating}
                />
              )}

              {/* File upload */}
              {audioSource === 'upload' && (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isGenerating || isUploading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating || isUploading}
                    className="w-full p-6 border-2 border-dashed border-gray-700 rounded-xl hover:border-purple-500/50 transition-colors text-center"
                  >
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Качване...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-500 mx-auto" />
                        <p className="text-gray-400 text-sm">
                          Натисни за да качиш MP3 файл
                        </p>
                      </div>
                    )}
                  </button>
                  {audioUrl && audioSource === 'upload' && (
                    <p className="text-xs text-green-400 truncate">
                      Качено: {audioUrl}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Style & Model */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Нов Стил
              </h3>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="напр. Jazz, Electronic, Reggaeton, Pop ballad..."
                label="Желан стил/жанр"
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
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {status === 'generating' ? 'Изпращане на заявка...' : 'Генериране на кавър...'}
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

          {/* Audio Player - Completed */}
          {status === 'completed' && audioResult && (
            <Card variant="gradient" padding="lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Кавърът е Готов!</p>
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
                  Нов Кавър
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {status === 'idle' && (
            <Button
              onClick={handleGenerate}
              disabled={!audioUrl.trim() || !hasEnoughCredits || isUploading}
              isLoading={isGenerating}
              leftIcon={<Disc3 className="w-5 h-5" />}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              size="lg"
            >
              Генерирай Кавър ({CREDIT_COSTS.cover} Кредита)
            </Button>
          )}

          {!hasEnoughCredits && status === 'idle' && (
            <p className="text-center text-sm text-red-400">
              Нямаш достатъчно кредити. Нужни са {CREDIT_COSTS.cover} кредита.
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
