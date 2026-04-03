'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import { Card, Button, Input, Textarea, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import {
  Sparkles,
  Music,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  RotateCcw,
  Coins,
  Mic,
  Film,
  Disc3,
  Layers,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Wand2,
  Play,
  Pause,
  Copy,
} from 'lucide-react';
// ─── Types ──────────────────────────────────────────────────
type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';
type ActiveTool = 'generate' | 'extend' | 'cover' | 'mashup' | 'vocals' | 'video';

interface AudioResult {
  url: string;
  title?: string;
  duration?: number;
}

const TOOL_CREDITS: Record<ActiveTool, number> = {
  generate: CREDIT_COSTS.music,
  extend: 5,
  cover: CREDIT_COSTS.cover,
  mashup: CREDIT_COSTS.mashup,
  vocals: CREDIT_COSTS.vocals_separate,
  video: CREDIT_COSTS.video,
};

// ─── Component ──────────────────────────────────────────────
export default function CreatePage() {
  const { user, deductCredits } = useUserStore();

  // Tool state
  const [activeTool, setActiveTool] = useState<ActiveTool>('generate');

  // Generate form state
  const [simplePrompt, setSimplePrompt] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Extend state
  const [extendTaskId, setExtendTaskId] = useState('');
  const [extendLyrics, setExtendLyrics] = useState('');
  const [extendStyle, setExtendStyle] = useState('');

  // Cover state
  const [coverAudioUrl, setCoverAudioUrl] = useState('');
  const [coverStyle, setCoverStyle] = useState('');

  // Mashup state
  const [mashupUrls, setMashupUrls] = useState<string[]>(['', '']);

  // Vocals state
  const [vocalsAudioUrl, setVocalsAudioUrl] = useState('');

  // Video state
  const [videoTaskId, setVideoTaskId] = useState('');

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<AudioResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Recent creations
  const [recentCreations, setRecentCreations] = useState<Array<{
    id: string;
    title?: string;
    audio_url?: string;
    created_at: string;
    type: string;
  }>>([]);

  const currentCost = TOOL_CREDITS[activeTool];
  const hasEnoughCredits = (user?.credits || 0) >= currentCost;
  const isGenerating = status === 'submitting' || status === 'processing';

  // Fetch recent creations on mount
  useEffect(() => {
    fetch('/api/studio/generations?limit=5')
      .then((res) => res.ok ? res.json() : { generations: [] })
      .then((data) => setRecentCreations(data.generations || []))
      .catch(() => {});
  }, []);

  // ─── Poll for status ──────────────────────────────────────
  const pollStatus = useCallback((id: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    const interval = 5000;

    const poll = async () => {
      try {
        const response = await fetch(`/api/suno/status?taskId=${id}`);
        const data = await response.json();

        if (data.status === 'completed') {
          const audioResults: AudioResult[] = [];
          if (data.audio_urls && data.audio_urls.length > 0) {
            data.audio_urls.forEach((url: string, i: number) => {
              audioResults.push({
                url,
                title: data.title ? `${data.title} (${i + 1})` : `Вариант ${i + 1}`,
                duration: data.duration,
              });
            });
          } else if (data.audio_url) {
            audioResults.push({
              url: data.audio_url,
              title: data.title || 'Резултат',
              duration: data.duration,
            });
          }
          setResults(audioResults);
          setStatus('completed');
          deductCredits(currentCost);
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
        setError(err instanceof Error ? err.message : 'Проверката се провали');
        setStatus('failed');
      }
    };

    poll();
  }, [currentCost, deductCredits]);

  // ─── Submit handler ────────────────────────────────────────
  const handleSubmit = async () => {
    if (isGenerating || !hasEnoughCredits) return;

    setStatus('submitting');
    setError(null);
    setResults([]);
    setTaskId(null);

    try {
      let endpoint = '';
      let body: Record<string, unknown> = {};

      switch (activeTool) {
        case 'generate':
          endpoint = '/api/suno/generate';
          if (isCustomMode) {
            body = { title, style, lyrics, model: 'V5', instrumental: isInstrumental };
          } else {
            body = { prompt: simplePrompt, model: 'V5', instrumental: isInstrumental };
          }
          break;

        case 'extend':
          endpoint = '/api/studio/extend';
          body = {
            taskId: extendTaskId.trim(),
            lyrics: extendLyrics.trim() || undefined,
            style: extendStyle.trim() || undefined,
            model: 'V5',
          };
          break;

        case 'cover':
          endpoint = '/api/studio/cover';
          body = {
            audioUrl: coverAudioUrl.trim(),
            style: coverStyle.trim() || undefined,
            model: 'V5',
          };
          break;

        case 'mashup':
          endpoint = '/api/studio/mashup';
          body = {
            audioUrls: mashupUrls.filter((u) => u.trim()),
            model: 'V5',
          };
          break;

        case 'vocals':
          endpoint = '/api/studio/vocals';
          body = {
            audioUrl: vocalsAudioUrl.trim(),
            action: 'separate',
          };
          break;

        case 'video':
          endpoint = '/api/studio/video';
          body = {
            taskId: videoTaskId.trim(),
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Заявката се провали');
      }

      setTaskId(data.task_id);
      setStatus('processing');
      pollStatus(data.task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
      setStatus('failed');
    }
  };

  // ─── Validation ────────────────────────────────────────────
  const isSubmitDisabled = (): boolean => {
    if (isGenerating || !hasEnoughCredits) return true;

    switch (activeTool) {
      case 'generate':
        return isCustomMode ? !lyrics.trim() : !simplePrompt.trim();
      case 'extend':
        return !extendTaskId.trim();
      case 'cover':
        return !coverAudioUrl.trim();
      case 'mashup':
        return mashupUrls.filter((u) => u.trim()).length < 2;
      case 'vocals':
        return !vocalsAudioUrl.trim();
      case 'video':
        return !videoTaskId.trim();
    }
  };

  // ─── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setStatus('idle');
    setTaskId(null);
    setResults([]);
    setError(null);
  };

  // ─── Audio playback ────────────────────────────────────────
  const togglePlay = (index: number) => {
    const audio = audioRefs.current[index];
    if (!audio) return;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      // Pause any currently playing
      audioRefs.current.forEach((a) => a?.pause());
      audio.play();
      setPlayingIndex(index);
    }
  };

  // Quick action: use result for extend/cover
  const handleExtendResult = (resultUrl: string) => {
    if (taskId) {
      setActiveTool('extend');
      setExtendTaskId(taskId);
      handleReset();
    }
  };

  const handleCoverResult = (resultUrl: string) => {
    setActiveTool('cover');
    setCoverAudioUrl(resultUrl);
    handleReset();
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            Създай Музика
          </h1>
          <p className="text-gray-400 text-lg">
            Всичко, от което имаш нужда, на едно място
          </p>
        </div>

        {/* ── Main Input Area (Glass Card) ───────────────────── */}
        <div className="relative p-6 lg:p-8 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">

          {/* Simple / Custom Toggle + Instrumental */}
          {activeTool === 'generate' && (
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {isCustomMode ? (
                  <ToggleRight className="w-5 h-5 text-purple-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                )}
                Custom
              </button>

              <button
                onClick={() => setIsInstrumental(!isInstrumental)}
                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {isInstrumental ? (
                  <ToggleRight className="w-5 h-5 text-cyan-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-500" />
                )}
                Инструментал
              </button>

            </div>
          )}

          {/* Generate Tab: Simple Mode */}
          {activeTool === 'generate' && !isCustomMode && (
            <Textarea
              value={simplePrompt}
              onChange={(e) => setSimplePrompt(e.target.value)}
              placeholder="Опиши песента, която искаш да създадеш... напр. 'Чалга балада за изгубена любов, женски вокал, бавно темпо'"
              className="min-h-[120px] text-base bg-transparent border-0 focus:ring-0 resize-none placeholder:text-gray-600"
              disabled={isGenerating}
            />
          )}

          {/* Generate Tab: Custom Mode */}
          {activeTool === 'generate' && isCustomMode && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                    Заглавие
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Име на песента..."
                    disabled={isGenerating}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                    Стил / Жанр
                  </label>
                  <Input
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="напр. Чалга, Поп, R&B..."
                    disabled={isGenerating}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Текст
                </label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder={`Напиши текста с метатагове...

[Verse]
В нощта се губя сам
в спомени от теб

[Chorus]
Копнея за теб
и няма да спра...

[Bridge]
Музиката ни свързва...`}
                  className="min-h-[200px] font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Extend Tab */}
          {activeTool === 'extend' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Task ID (от предишна генерация)
                </label>
                <Input
                  value={extendTaskId}
                  onChange={(e) => setExtendTaskId(e.target.value)}
                  placeholder="Въведи Task ID..."
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Допълнителен текст (по избор)
                </label>
                <Textarea
                  value={extendLyrics}
                  onChange={(e) => setExtendLyrics(e.target.value)}
                  placeholder={`[Verse 2]\nНова строфа тук...\n\n[Chorus]\nНов припев...`}
                  className="min-h-[120px] font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Стил за удължението (по избор)
                </label>
                <Input
                  value={extendStyle}
                  onChange={(e) => setExtendStyle(e.target.value)}
                  placeholder="напр. По-бърз темп, електронни елементи"
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Cover Tab */}
          {activeTool === 'cover' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  URL на аудио файл
                </label>
                <Input
                  value={coverAudioUrl}
                  onChange={(e) => setCoverAudioUrl(e.target.value)}
                  placeholder="https://... линк към песен"
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Нов стил (по избор)
                </label>
                <Input
                  value={coverStyle}
                  onChange={(e) => setCoverStyle(e.target.value)}
                  placeholder="напр. Jazz, Acoustic, Lo-fi..."
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* Mashup Tab */}
          {activeTool === 'mashup' && (
            <div className="space-y-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                Аудио URL-и (минимум 2)
              </label>
              {mashupUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-6">{i + 1}.</span>
                  <Input
                    value={url}
                    onChange={(e) => {
                      const updated = [...mashupUrls];
                      updated[i] = e.target.value;
                      setMashupUrls(updated);
                    }}
                    placeholder={`https://... песен ${i + 1}`}
                    disabled={isGenerating}
                  />
                </div>
              ))}
              <button
                onClick={() => setMashupUrls([...mashupUrls, ''])}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                + Добави още
              </button>
            </div>
          )}

          {/* Vocals Tab */}
          {activeTool === 'vocals' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  URL на аудио файл
                </label>
                <Input
                  value={vocalsAudioUrl}
                  onChange={(e) => setVocalsAudioUrl(e.target.value)}
                  placeholder="https://... линк към песен за разделяне"
                  disabled={isGenerating}
                />
              </div>
              <p className="text-xs text-gray-500">
                Разделя вокалите от инструментала. Получаваш 2 файла: вокали + инструментал.
              </p>
            </div>
          )}

          {/* Video Tab */}
          {activeTool === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Task ID (от генерирана песен)
                </label>
                <Input
                  value={videoTaskId}
                  onChange={(e) => setVideoTaskId(e.target.value)}
                  placeholder="Въведи Task ID за създаване на видео..."
                  disabled={isGenerating}
                />
              </div>
              <p className="text-xs text-gray-500">
                Създава музикално видео от генерирана песен. Използва AI визуализация.
              </p>
            </div>
          )}

          {/* ── Submit Button + Credit Cost ──────────────────── */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className={`
                flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg
                transition-all duration-300
                ${isSubmitDisabled()
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-500 hover:to-cyan-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 active:scale-[0.98]'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {status === 'submitting' ? 'Изпращане...' : 'Генериране...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Създай
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-sm">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-400">
                <strong className="text-white">{currentCost}</strong> кредита
              </span>
            </div>
          </div>
        </div>

        {/* ── Tool Tabs ──────────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1.5 bg-white/[0.03] rounded-xl border border-white/[0.08] overflow-x-auto">
          {([
            { id: 'generate' as ActiveTool, icon: Music, label: 'Генерирай', cost: TOOL_CREDITS.generate },
            { id: 'extend' as ActiveTool, icon: RefreshCw, label: 'Удължи', cost: TOOL_CREDITS.extend },
            { id: 'cover' as ActiveTool, icon: Disc3, label: 'Cover', cost: TOOL_CREDITS.cover },
            { id: 'mashup' as ActiveTool, icon: Layers, label: 'Mashup', cost: TOOL_CREDITS.mashup },
            { id: 'vocals' as ActiveTool, icon: Mic, label: 'Вокали', cost: TOOL_CREDITS.vocals },
            { id: 'video' as ActiveTool, icon: Film, label: 'Видео', cost: TOOL_CREDITS.video },
          ]).map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                if (!isGenerating) {
                  setActiveTool(tool.id);
                  if (status !== 'idle') handleReset();
                }
              }}
              disabled={isGenerating}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTool === tool.id
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <tool.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tool.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">
                {tool.cost}
              </span>
            </button>
          ))}
        </div>

        {/* ── Credit Bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/5 to-cyan-600/5 border border-white/[0.06] rounded-xl">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Coins className="w-4 h-4 text-yellow-500" />
            Налични кредити:
            <strong className={hasEnoughCredits ? 'text-green-400' : 'text-red-400'}>
              {user?.credits || 0}
            </strong>
          </div>
          {!hasEnoughCredits && (
            <span className="text-xs text-red-400">
              Нямаш достатъчно кредити за тази операция
            </span>
          )}
        </div>

        {/* ── Error Display ──────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={handleReset}
              className="text-sm text-red-300 hover:text-white transition-colors"
            >
              Опитай отново
            </button>
          </div>
        )}

        {/* ── Processing Status ──────────────────────────────── */}
        {isGenerating && (
          <div className="p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-600/5 to-cyan-600/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-white">
                  {status === 'submitting' ? 'Изпращане на заявка...' : 'Генериране...'}
                </p>
                <p className="text-sm text-gray-400">
                  Обикновено отнема 1-3 минути. Моля, изчакай.
                </p>
              </div>
            </div>
            {taskId && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-xs text-gray-500">
                  Task ID: {taskId}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(taskId)}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Results ────────────────────────────────────────── */}
        {status === 'completed' && results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Резултати</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Генерирай Ново
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">
                      {result.title || `Вариант ${index + 1}`}
                    </h3>
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {Math.floor(result.duration / 60)}:{String(Math.floor(result.duration % 60)).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* Audio element */}
                  <audio
                    ref={(el) => { audioRefs.current[index] = el; }}
                    src={result.url}
                    onEnded={() => setPlayingIndex(null)}
                    className="hidden"
                  />

                  {/* Simple waveform placeholder + play */}
                  <button
                    onClick={() => togglePlay(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors group"
                  >
                    <div className={`
                      p-2 rounded-full transition-colors
                      ${playingIndex === index ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'}
                    `}>
                      {playingIndex === index ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </div>
                    {/* Waveform bars */}
                    <div className="flex-1 flex items-center gap-[2px] h-8">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`
                            flex-1 rounded-full transition-all duration-150
                            ${playingIndex === index ? 'bg-purple-400' : 'bg-gray-700'}
                          `}
                          style={{
                            height: `${20 + Math.sin(i * 0.5) * 60 + Math.random() * 20}%`,
                          }}
                        />
                      ))}
                    </div>
                  </button>

                  {/* Full audio controls */}
                  <audio src={result.url} controls className="w-full h-8" />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <a href={result.url} download className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Свали
                      </Button>
                    </a>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleExtendResult(result.url)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Удължи
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCoverResult(result.url)}
                      leftIcon={<Disc3 className="w-3.5 h-3.5" />}
                    >
                      Cover
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Task ID for reference */}
            {taskId && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Task ID: {taskId}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(taskId)}
                  className="hover:text-gray-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Recent Creations ───────────────────────────────── */}
        {recentCreations.length > 0 && status === 'idle' && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Последни Създания
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {recentCreations.map((creation) => (
                <div
                  key={creation.id}
                  className="flex-shrink-0 w-48 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-medium text-white truncate">
                      {creation.title || creation.type || 'Песен'}
                    </span>
                  </div>
                  {creation.audio_url && (
                    <audio src={creation.audio_url} controls className="w-full h-7" />
                  )}
                  <p className="text-[10px] text-gray-600">
                    {new Date(creation.created_at).toLocaleDateString('bg-BG')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
