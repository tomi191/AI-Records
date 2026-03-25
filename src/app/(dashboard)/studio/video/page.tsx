'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Card, Button, Input } from '@/components/ui';
import {
  Video,
  AlertCircle,
  Loader2,
  Download,
  RotateCcw,
  Coins,
  Play,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';

const VIDEO_CREDIT_COST = 2;

export default function VideoPage() {
  const { user, deductCredits } = useUserStore();

  const [taskId, setTaskId] = useState('');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughCredits = (user?.credits || 0) >= VIDEO_CREDIT_COST;
  const isGenerating = status === 'submitting' || status === 'processing';

  const handleGenerate = async () => {
    if (!taskId.trim() || isGenerating || !hasEnoughCredits) return;

    setStatus('submitting');
    setError(null);
    setVideoUrl(null);
    setResultTaskId(null);

    try {
      const response = await fetch('/api/studio/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: taskId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Video generation failed');
      }

      setResultTaskId(data.task_id);
      setStatus('processing');
      pollStatus(data.task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
      setStatus('failed');
    }
  };

  const pollStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 90; // Videos can take longer
    const interval = 5000;

    const poll = async () => {
      try {
        const response = await fetch(`/api/suno/status?taskId=${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setVideoUrl(data.audio_url); // API returns video URL in audio_url field
          setStatus('completed');
          deductCredits(VIDEO_CREDIT_COST);
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Генерирането на видео се провали');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          throw new Error('Времето за генериране изтече');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Проверката на статуса се провали');
        setStatus('failed');
      }
    };

    poll();
  };

  const handleReset = () => {
    setStatus('idle');
    setResultTaskId(null);
    setVideoUrl(null);
    setError(null);
    setTaskId('');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Музикално Видео</h1>
              <p className="text-gray-400">
                Създай MP4 видео с визуализации за твоята песен
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Credit Info */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-300">
                Цена: <strong className="text-white">{VIDEO_CREDIT_COST} кредита</strong>
              </span>
            </div>
            <span className="text-sm text-gray-400">
              Налични: <strong className={hasEnoughCredits ? 'text-blue-400' : 'text-red-400'}>{user?.credits || 0}</strong>
            </span>
          </div>

          {/* Task ID Input */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                ID на задачата (от завършена генерация на музика)
              </h3>
              <Input
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Въведи Task ID от генерирана песен..."
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                Използвай ID-то от завършена музикална генерация, за да създадеш видео визуализация.
              </p>
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
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {status === 'submitting' ? 'Изпращане...' : 'Генериране на видео...'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Видеото може да отнеме 3-5 минути. Моля, изчакай.
                  </p>
                </div>
              </div>
              {resultTaskId && (
                <p className="mt-4 text-xs text-gray-500">
                  ID на задачата: {resultTaskId}
                </p>
              )}
            </Card>
          )}

          {/* Video Player - Completed */}
          {status === 'completed' && videoUrl && (
            <Card variant="gradient" padding="lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Play className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Видеото е Готово!</p>
                  <p className="text-sm text-gray-400">
                    Можеш да го гледаш и изтеглиш
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-xl">
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  playsInline
                />
              </div>

              <div className="flex gap-3 mt-6">
                <a href={videoUrl} download className="flex-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Изтегли MP4
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Ново Видео
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {status === 'idle' && (
            <Button
              onClick={handleGenerate}
              disabled={!taskId.trim() || !hasEnoughCredits}
              isLoading={isGenerating}
              leftIcon={<Video className="w-5 h-5" />}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
              size="lg"
            >
              Генерирай Видео ({VIDEO_CREDIT_COST} Кредита)
            </Button>
          )}

          {!hasEnoughCredits && status === 'idle' && (
            <p className="text-center text-sm text-red-400">
              Нямаш достатъчно кредити. Нужни са {VIDEO_CREDIT_COST} кредита.
            </p>
          )}

          {status === 'failed' && (
            <Button
              onClick={handleReset}
              variant="secondary"
              leftIcon={<RotateCcw className="w-4 h-4" />}
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
