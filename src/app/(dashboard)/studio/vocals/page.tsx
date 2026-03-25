'use client';

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Card, Button, Input } from '@/components/ui';
import {
  MicVocal,
  AlertCircle,
  Loader2,
  Music,
  Download,
  RotateCcw,
  Coins,
  SplitSquareHorizontal,
  Mic2,
  Piano,
} from 'lucide-react';

type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';
type VocalAction = 'separate' | 'add_vocals' | 'add_instrumental';

const CREDIT_COSTS: Record<VocalAction, number> = {
  separate: 4,
  add_vocals: 5,
  add_instrumental: 5,
};

const ACTION_OPTIONS: { value: VocalAction; label: string; description: string; icon: typeof MicVocal; cost: number }[] = [
  {
    value: 'separate',
    label: 'Раздели Вокали',
    description: 'Извлечи вокалите от инструментала',
    icon: SplitSquareHorizontal,
    cost: 4,
  },
  {
    value: 'add_vocals',
    label: 'Добави Вокали',
    description: 'Добави вокали към инструментал',
    icon: Mic2,
    cost: 5,
  },
  {
    value: 'add_instrumental',
    label: 'Добави Инструментал',
    description: 'Добави инструментал към вокали',
    icon: Piano,
    cost: 5,
  },
];

export default function VocalsPage() {
  const { user, deductCredits } = useUserStore();

  const [action, setAction] = useState<VocalAction>('separate');
  const [audioUrl, setAudioUrl] = useState('');

  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [audioResult, setAudioResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const creditCost = CREDIT_COSTS[action];
  const hasEnoughCredits = (user?.credits || 0) >= creditCost;
  const isGenerating = status === 'submitting' || status === 'processing';

  const handleGenerate = async () => {
    if (!audioUrl.trim() || isGenerating || !hasEnoughCredits) return;

    setStatus('submitting');
    setError(null);
    setAudioResult(null);
    setResultTaskId(null);

    try {
      const response = await fetch('/api/studio/vocals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: audioUrl.trim(),
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Processing failed');
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
    const maxAttempts = 60;
    const interval = 5000;

    const poll = async () => {
      try {
        const response = await fetch(`/api/suno/status?taskId=${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setAudioResult(data.audio_url);
          setStatus('completed');
          deductCredits(creditCost);
          return;
        }

        if (data.status === 'failed') {
          throw new Error(data.error || 'Обработката се провали');
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, interval);
        } else {
          throw new Error('Времето за обработка изтече');
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
    setAudioResult(null);
    setError(null);
    setAudioUrl('');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl">
              <MicVocal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Вокали</h1>
              <p className="text-gray-400">
                Раздели, добави или обработи вокали и инструментали
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Action Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ACTION_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = action === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setAction(opt.value)}
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-500/30 ring-1 ring-pink-500/20'
                      : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                  } disabled:opacity-50`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-pink-400' : 'text-gray-500'}`} />
                  <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                  <p className={`text-xs mt-2 ${isSelected ? 'text-pink-400' : 'text-gray-600'}`}>
                    {opt.cost} кредита
                  </p>
                </button>
              );
            })}
          </div>

          {/* Credit Info */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-600/10 to-rose-600/10 border border-pink-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-gray-300">
                Цена: <strong className="text-white">{creditCost} кредита</strong>
              </span>
            </div>
            <span className="text-sm text-gray-400">
              Налични: <strong className={hasEnoughCredits ? 'text-pink-400' : 'text-red-400'}>{user?.credits || 0}</strong>
            </span>
          </div>

          {/* Audio URL Input */}
          <Card variant="glass" padding="md">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                URL на аудио файла
              </h3>
              <Input
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://example.com/song.mp3"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                Въведи линк към MP3 файл за обработка.
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
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {status === 'submitting' ? 'Изпращане...' : 'Обработка...'}
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
          {status === 'completed' && audioResult && (
            <Card variant="gradient" padding="lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Music className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Готово!</p>
                  <p className="text-sm text-gray-400">
                    Резултатът е готов за слушане
                  </p>
                </div>
              </div>

              <div className="p-4 bg-black/20 rounded-xl">
                <audio src={audioResult} controls className="w-full" />
              </div>

              <div className="flex gap-3 mt-6">
                <a href={audioResult} download className="flex-1">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Изтегли
                  </Button>
                </a>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Нова Обработка
                </Button>
              </div>
            </Card>
          )}

          {/* Generate Button */}
          {status === 'idle' && (
            <Button
              onClick={handleGenerate}
              disabled={!audioUrl.trim() || !hasEnoughCredits}
              isLoading={isGenerating}
              leftIcon={<MicVocal className="w-5 h-5" />}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500"
              size="lg"
            >
              {ACTION_OPTIONS.find((o) => o.value === action)?.label} ({creditCost} Кредита)
            </Button>
          )}

          {!hasEnoughCredits && status === 'idle' && (
            <p className="text-center text-sm text-red-400">
              Нямаш достатъчно кредити. Нужни са {creditCost} кредита.
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
