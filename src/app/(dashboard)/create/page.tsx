'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import { usePlayerStore } from '@/store/playerStore';
import { Card, Button, Input, Textarea, Badge, Slider, TrackCard } from '@/components/ui';
import { formatDuration } from '@/lib/utils';
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
  Play,
  Pause,
  Copy,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Music2,
  Wand2,
} from 'lucide-react';
import type { Track } from '@/lib/supabase/types';

// ─── Types ──────────────────────────────────────────────────
type GenerationStatus = 'idle' | 'submitting' | 'processing' | 'completed' | 'failed';
type ActiveTool = 'generate' | 'extend' | 'cover' | 'mashup';
type CreateMode = 'simple' | 'advanced';
type SortOrder = 'newest' | 'oldest';

interface AudioResult {
  url: string;
  title?: string;
  duration?: number;
}

interface WorkspaceGeneration {
  id: string;
  title?: string;
  audio_url?: string;
  cover_url?: string;
  style?: string;
  type: string;
  status: string;
  created_at: string;
  duration?: number;
  model_version?: string;
  credits_used?: number;
  task_id?: string;
}

const TOOL_CREDITS: Record<ActiveTool, number> = {
  generate: CREDIT_COSTS.music,
  extend: 5,
  cover: CREDIT_COSTS.cover,
  mashup: CREDIT_COSTS.mashup,
};

const TOOL_CONFIG = [
  { id: 'generate' as ActiveTool, icon: Music, label: 'Генерирай', cost: TOOL_CREDITS.generate },
  { id: 'extend' as ActiveTool, icon: RefreshCw, label: 'Удължи', cost: TOOL_CREDITS.extend },
  { id: 'cover' as ActiveTool, icon: Disc3, label: 'Cover', cost: TOOL_CREDITS.cover },
  { id: 'mashup' as ActiveTool, icon: Layers, label: 'Mashup', cost: TOOL_CREDITS.mashup },
];

// ─── Component ──────────────────────────────────────────────
function CreatePageContent() {
  const { user, deductCredits } = useUserStore();
  const searchParams = useSearchParams();

  // Mode & tool state
  const [mode, setMode] = useState<CreateMode>('simple');
  const [activeTool, setActiveTool] = useState<ActiveTool>('generate');
  const [moreOptions, setMoreOptions] = useState(false);

  // Generate form state
  const [simplePrompt, setSimplePrompt] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [negativeTags, setNegativeTags] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState<'m' | 'f' | ''>('');
  const [styleWeight, setStyleWeight] = useState(50);

  // Extend state
  const [extendTaskId, setExtendTaskId] = useState('');
  const [extendLyrics, setExtendLyrics] = useState('');
  const [extendStyle, setExtendStyle] = useState('');

  // Cover state
  const [coverAudioUrl, setCoverAudioUrl] = useState('');
  const [coverStyle, setCoverStyle] = useState('');

  // Mashup state
  const [mashupUrls, setMashupUrls] = useState<string[]>(['', '']);

  // Generation state
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<AudioResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // Workspace state
  const [generations, setGenerations] = useState<WorkspaceGeneration[]>([]);
  const [genLoading, setGenLoading] = useState(true);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const currentCost = TOOL_CREDITS[activeTool];
  const hasEnoughCredits = (user?.credits || 0) >= currentCost;
  const isGenerating = status === 'submitting' || status === 'processing';

  // Handle URL params (tab=extend&taskId=X, tab=cover)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const urlTaskId = searchParams.get('taskId');
    if (tab === 'extend') {
      setActiveTool('extend');
      if (urlTaskId) setExtendTaskId(urlTaskId);
    } else if (tab === 'cover') {
      setActiveTool('cover');
    } else if (tab === 'mashup') {
      setActiveTool('mashup');
    }
  }, [searchParams]);

  // Fetch workspace generations
  const fetchGenerations = useCallback(async () => {
    try {
      setGenLoading(true);
      const res = await fetch('/api/studio/generations?limit=50');
      const data = res.ok ? await res.json() : { generations: [] };
      setGenerations(data.generations || []);
    } catch {
      // silently fail
    } finally {
      setGenLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

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
          // Refresh workspace
          fetchGenerations();
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
  }, [currentCost, deductCredits, fetchGenerations]);

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
          if (mode === 'advanced') {
            body = {
              title,
              style,
              lyrics,
              model: 'V5',
              instrumental: isInstrumental,
              negativeTags: negativeTags || undefined,
              vocalGender: vocalGender || undefined,
              styleWeight: styleWeight / 100,
            };
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
        return mode === 'advanced' ? !lyrics.trim() : !simplePrompt.trim();
      case 'extend':
        return !extendTaskId.trim();
      case 'cover':
        return !coverAudioUrl.trim();
      case 'mashup':
        return mashupUrls.filter((u) => u.trim()).length < 2;
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
      audioRefs.current.forEach((a) => a?.pause());
      audio.play();
      setPlayingIndex(index);
    }
  };

  // Quick actions from results
  const handleExtendResult = () => {
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

  // ─── Workspace filtering/sorting ───────────────────────────
  const filteredGenerations = generations
    .filter((g) => {
      if (!workspaceSearch) return true;
      const q = workspaceSearch.toLowerCase();
      return (
        (g.title || '').toLowerCase().includes(q) ||
        (g.style || '').toLowerCase().includes(q) ||
        (g.type || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">

        {/* ════════════════ LEFT PANEL: CREATION ════════════════ */}
        <div className="w-full lg:w-[420px] lg:flex-shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem-6rem)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
          <div className="space-y-4">

            {/* ── Mode Toggle: Simple / Advanced ──────────── */}
            {activeTool === 'generate' && (
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.08]">
                <button
                  onClick={() => setMode('simple')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === 'simple'
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  Опростен
                </button>
                <button
                  onClick={() => setMode('advanced')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === 'advanced'
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  Разширен
                </button>
              </div>
            )}

            {/* ── Main Input Card ─────────────────────────── */}
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl space-y-4">

              {/* Generate: Simple Mode */}
              {activeTool === 'generate' && mode === 'simple' && (
                <Textarea
                  value={simplePrompt}
                  onChange={(e) => setSimplePrompt(e.target.value)}
                  placeholder="Опиши песента, която искаш да създадеш... напр. 'Чалга балада за изгубена любов, женски вокал, бавно темпо'"
                  className="min-h-[140px] text-base bg-transparent border-0 focus:ring-0 resize-none placeholder:text-gray-600"
                  disabled={isGenerating}
                />
              )}

              {/* Generate: Advanced Mode */}
              {activeTool === 'generate' && mode === 'advanced' && (
                <div className="space-y-3">
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
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Текст (Lyrics)
                    </label>
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      placeholder={`[Verse]\nВ нощта се губя сам\nв спомени от теб\n\n[Chorus]\nКопнея за теб\nи няма да спра...`}
                      className="min-h-[180px] font-mono text-sm"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                      Изключи стилове (negativeTags)
                    </label>
                    <Input
                      value={negativeTags}
                      onChange={(e) => setNegativeTags(e.target.value)}
                      placeholder="напр. Heavy Metal, Drums..."
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              )}

              {/* Extend Tool */}
              {activeTool === 'extend' && (
                <div className="space-y-3">
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
                      placeholder={`[Verse 2]\nНова строфа...\n\n[Chorus]\nНов припев...`}
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

              {/* Cover Tool */}
              {activeTool === 'cover' && (
                <div className="space-y-3">
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

              {/* Mashup Tool */}
              {activeTool === 'mashup' && (
                <div className="space-y-3">
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

              {/* ── Instrumental Toggle ────────────────────── */}
              {activeTool === 'generate' && (
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
                  <button
                    onClick={() => setIsInstrumental(!isInstrumental)}
                    className={`
                      relative w-10 h-5 rounded-full transition-colors duration-200
                      ${isInstrumental ? 'bg-cyan-600' : 'bg-white/10'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200
                        ${isInstrumental ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                  <span className="text-sm text-gray-300">Инструментал</span>
                </div>
              )}

              {/* ── More Options (collapsible) ─────────────── */}
              {activeTool === 'generate' && mode === 'advanced' && (
                <div className="border-t border-white/[0.05] pt-3">
                  <button
                    onClick={() => setMoreOptions(!moreOptions)}
                    className="flex items-center gap-2 w-full text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {moreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Повече опции
                  </button>

                  {moreOptions && (
                    <div className="mt-3 space-y-4">
                      {/* Vocal Gender */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Вокал
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: '' as const, label: 'Автоматичен' },
                            { value: 'm' as const, label: 'Мъжки' },
                            { value: 'f' as const, label: 'Женски' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setVocalGender(opt.value)}
                              className={`
                                flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors
                                ${vocalGender === opt.value
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                  : 'text-gray-400 border-white/[0.06] hover:border-white/10 hover:text-white'
                                }
                              `}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Style Weight */}
                      <div>
                        <Slider
                          label="Придържане към стила"
                          showValue
                          valueFormatter={(v) => `${v}%`}
                          value={styleWeight}
                          min={0}
                          max={100}
                          step={5}
                          onChange={(e) => setStyleWeight(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Tool Tabs ───────────────────────────────── */}
            <div className="grid grid-cols-4 gap-1 p-1.5 bg-white/[0.03] rounded-xl border border-white/[0.08]">
              {TOOL_CONFIG.map((tool) => (
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
                    flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${activeTool === tool.id
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    }
                    ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <tool.icon className="w-4 h-4" />
                  <span>{tool.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10">
                    {tool.cost} кр.
                  </span>
                </button>
              ))}
            </div>

            {/* ── Submit Button ────────────────────────────── */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className={`
                w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg
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
                  <span className="flex items-center gap-1 text-sm font-normal opacity-80">
                    <Coins className="w-3.5 h-3.5" />
                    {currentCost} кр.
                  </span>
                </>
              )}
            </button>

            {/* ── Credit Bar ──────────────────────────────── */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/5 to-cyan-600/5 border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Coins className="w-4 h-4 text-yellow-500" />
                Налични:
                <strong className={hasEnoughCredits ? 'text-green-400' : 'text-red-400'}>
                  {user?.credits || 0}
                </strong>
                кредита
              </div>
              {!hasEnoughCredits && (
                <span className="text-xs text-red-400">Недостатъчно</span>
              )}
            </div>

            {/* ── Error Display ────────────────────────────── */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{error}</span>
                <button
                  onClick={handleReset}
                  className="text-sm text-red-300 hover:text-white transition-colors whitespace-nowrap"
                >
                  Опитай отново
                </button>
              </div>
            )}

            {/* ── Processing Status ───────────────────────── */}
            {isGenerating && (
              <div className="p-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-600/5 to-cyan-600/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {status === 'submitting' ? 'Изпращане...' : 'Генериране...'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Обикновено 1-3 минути
                    </p>
                  </div>
                </div>
                {taskId && (
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-[10px] text-gray-500 truncate">
                      Task: {taskId}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(taskId)}
                      className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Results (inline in left panel) ──────────── */}
            {status === 'completed' && results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Резултати</h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Ново
                  </button>
                </div>

                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-white/10 bg-white/[0.03] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white truncate">
                        {result.title || `Вариант ${index + 1}`}
                      </h4>
                      {result.duration && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(result.duration)}
                        </span>
                      )}
                    </div>

                    <audio
                      ref={(el) => { audioRefs.current[index] = el; }}
                      src={result.url}
                      onEnded={() => setPlayingIndex(null)}
                      className="hidden"
                    />

                    <button
                      onClick={() => togglePlay(index)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                      <div className={`
                        p-1.5 rounded-full transition-colors
                        ${playingIndex === index ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'}
                      `}>
                        {playingIndex === index ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-[2px] h-6">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-150 ${playingIndex === index ? 'bg-purple-400' : 'bg-gray-700'}`}
                            style={{ height: `${20 + Math.sin(i * 0.5) * 60 + Math.random() * 20}%` }}
                          />
                        ))}
                      </div>
                    </button>

                    <div className="flex gap-2">
                      <a href={result.url} download className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                          Свали
                        </Button>
                      </a>
                      <Button variant="secondary" size="sm" onClick={handleExtendResult} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                        Удължи
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleCoverResult(result.url)} leftIcon={<Disc3 className="w-3.5 h-3.5" />}>
                        Cover
                      </Button>
                    </div>
                  </div>
                ))}

                {taskId && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-600">
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
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL: WORKSPACE ════════════════ */}
        <div className="flex-1 min-w-0">

          {/* ── Workspace Header ──────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Music2 className="w-5 h-5 text-purple-400" />
              Workspace
            </h2>
            <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  placeholder="Търси..."
                  className="w-full pl-9 pr-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                />
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'newest' ? 'Най-нови' : 'Най-стари'}
              </button>
            </div>
          </div>

          {/* ── Generating Placeholder Card ────────────────── */}
          {isGenerating && (
            <div className="mb-3 p-4 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-600/5 to-cyan-600/5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-[60px] h-[60px] rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Генериране...</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeTool === 'generate' ? 'Нова песен' : activeTool === 'extend' ? 'Удължаване' : activeTool === 'cover' ? 'Cover' : 'Mashup'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    <span className="text-[10px] text-gray-500">Обработва се...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Loading State ──────────────────────────────── */}
          {genLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          )}

          {/* ── Empty State ────────────────────────────────── */}
          {!genLoading && filteredGenerations.length === 0 && (
            <div className="text-center py-20">
              <div className="p-4 bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">
                {workspaceSearch
                  ? 'Няма резултати за търсенето'
                  : 'Все още нямаш генерации'
                }
              </h3>
              <p className="text-sm text-gray-500">
                {workspaceSearch
                  ? 'Опитай с друга заявка'
                  : 'Натисни Създай, за да генерираш първата си песен!'
                }
              </p>
            </div>
          )}

          {/* ── Track Cards ────────────────────────────────── */}
          {!genLoading && filteredGenerations.length > 0 && (
            <div className="space-y-1">
              {filteredGenerations.map((gen) => {
                // Map generation to Track-like object for TrackCard
                const pseudoTrack: Track = {
                  id: gen.id,
                  user_id: null,
                  uploaded_by: null,
                  title: gen.title || gen.type || 'Песен',
                  artist: 'Sarys',
                  audio_url: gen.audio_url || null,
                  youtube_url: null,
                  cover_url: gen.cover_url || null,
                  lyrics: null,
                  style: gen.style || null,
                  is_public: false,
                  is_featured: false,
                  play_count: 0,
                  download_count: 0,
                  duration: gen.duration || null,
                  file_size: null,
                  category: gen.type === 'cover' ? 'cover' : gen.type === 'music' ? 'ai_generated' : 'original',
                  tags: gen.model_version ? [gen.model_version] : [],
                  publish_at: null,
                  description: null,
                  spotify_url: null,
                  created_at: gen.created_at,
                };

                // If it's a pending/processing generation
                if (gen.status === 'pending' || gen.status === 'processing') {
                  return (
                    <div
                      key={gen.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border-l-2 border-l-yellow-500/50"
                    >
                      <div className="w-[60px] h-[60px] rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {gen.title || gen.type || 'Генерация'}
                        </p>
                        <p className="text-xs text-yellow-400 mt-0.5">Обработва се...</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {new Date(gen.created_at).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex-shrink-0">
                        {gen.type}
                      </span>
                    </div>
                  );
                }

                // Failed generation
                if (gen.status === 'failed') {
                  return (
                    <div
                      key={gen.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border-l-2 border-l-red-500/50"
                    >
                      <div className="w-[60px] h-[60px] rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {gen.title || gen.type || 'Генерация'}
                        </p>
                        <p className="text-xs text-red-400 mt-0.5">Грешка</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                          {new Date(gen.created_at).toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">
                        {gen.type}
                      </span>
                    </div>
                  );
                }

                // Completed generation — use TrackCard
                return (
                  <TrackCard
                    key={gen.id}
                    track={pseudoTrack}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>}>
      <CreatePageContent />
    </Suspense>
  );
}
