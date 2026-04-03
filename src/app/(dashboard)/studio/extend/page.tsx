'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Card, Button, Input, Textarea } from '@/components/ui';
import {
  RefreshCw,
  Music,
  AlertCircle,
  Loader2,
  Download,
  RotateCcw,
  Coins,
} from 'lucide-react';
type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';

const EXTEND_CREDIT_COST = 5;

export default function ExtendPage() {
  const { user, deductCredits } = useUserStore();

  const [taskId, setTaskId] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [style, setStyle] = useState('');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const hasEnoughCredits = (user?.credits || 0) >= EXTEND_CREDIT_COST;

  const handleExtend = async () => {
    if (!taskId.trim() || status === 'submitting' || status === 'processing') return;
    if (!hasEnoughCredits) return;

    setStatus('submitting');
    setError(null);
    setAudioUrl(null);
    setResultTaskId(null);

    try {
      const response = await fetch('/api/studio/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: taskId.trim(),
          lyrics: lyrics.trim() || undefined,
          style: style.trim() || undefined,
          model: 'V5',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Extend failed');
      }

      setResultTaskId(data.task_id);
      setStatus('processing');

      // Start polling for status
      pollStatus(data.task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
      setStatus('failed');
    }
  };

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
          deductCredits(EXTEND_CREDIT_COST);
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Генерирането се провали');
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
    setAudioUrl(null);
    setError(null);
    setTaskId('');
    setLyrics('');
    setStyle('');
  };

  const isGenerating = status === 'submitting' || status === 'processing';

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Удължи Песен</h1>
          </div>
          <p className="text-gray-400">
            Добави нови куплети, припев или инструментал към съществуваща песен
          </p>
        </div>

        <div className="space-y-6">
          {/* Credit Info */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-gray-300">
                Цена: <strong className="text-white">{EXTEND_CREDIT_COST} кредита</strong>
              </span>
            </div>
            <span className="text-sm text-gray-400">
              Налични: <strong className={hasEnoughCredits ? 'text-emerald-400' : 'text-red-400'}>{user?.credits || 0}</strong>
            </span>
          </div>

          {/* Task ID Input */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                ID на задачата (от предишна генерация)
              </h3>
              <Input
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="Въведи Task ID от генерирана песен..."
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                Можеш да намериш ID-то в резултата от предишна генерация на музика.
              </p>
            </div>
          </Card>

          {/* Lyrics for Extension */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Текст за удължение (по избор)
              </h3>
              <Textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={`Добави текст за новата част...

[Verse 2]
Нова строфа тук...

[Chorus]
Нов припев...`}
                className="min-h-[150px] font-mono text-sm"
                disabled={isGenerating}
              />
            </div>
          </Card>

          {/* Style Input */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Стил за удължението (по избор)
              </h3>
              <Input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="напр. 'По-бърз темп, електронни елементи'"
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
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {status === 'submitting' ? 'Изпращане...' : 'Генериране...'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Обикновено отнема 1-3 минути. Моля, изчакай.
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

          {/* Audio Player - Completed */}
          {status === 'completed' && audioUrl && (
            <Card variant="gradient" padding="lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Готово!</p>
                  <p className="text-sm text-gray-400">
                    Удължената песен е готова за слушане
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-xl">
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <a href={audioUrl} download className="flex-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Изтегли MP3
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Генерирай Ново
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {status === 'idle' && (
            <Button
              onClick={handleExtend}
              disabled={!taskId.trim() || !hasEnoughCredits}
              isLoading={isGenerating}
              leftIcon={<RefreshCw className="w-5 h-5" />}
              className="w-full"
              size="lg"
            >
              Удължи Песен ({EXTEND_CREDIT_COST} Кредита)
            </Button>
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
