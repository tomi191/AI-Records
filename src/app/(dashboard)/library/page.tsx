'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Library,
  Search,
  Filter,
  Music,
  PenTool,
  Loader2,
  Download,
  Play,
  Eye,
  Wand2,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Heart,
} from 'lucide-react';
import { Card, Input, Badge, Button, Modal } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { TrackList } from '@/components/player';
import type { Track } from '@/lib/supabase/types';

// ── Generation types (from my-music) ──

interface Generation {
  id: string;
  user_id: string;
  type: string;
  style?: string;
  mood?: string;
  topic?: string;
  lyrics?: string;
  audio_url?: string;
  credits_used: number;
  status: string;
  created_at: string;
  model_version?: string;
  generation_type?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Music }> = {
  lyrics: { label: 'Текст', color: 'purple', icon: PenTool },
  music: { label: 'Музика', color: 'cyan', icon: Music },
  extend: { label: 'Удължи', color: 'emerald', icon: RefreshCw },
  cover: { label: 'Cover', color: 'orange', icon: Music },
  vocals: { label: 'Вокали', color: 'pink', icon: Music },
  video: { label: 'Видео', color: 'blue', icon: Music },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Изчакване', color: 'yellow', icon: Clock },
  processing: { label: 'Обработка', color: 'blue', icon: Loader2 },
  completed: { label: 'Готово', color: 'green', icon: CheckCircle2 },
  failed: { label: 'Грешка', color: 'red', icon: XCircle },
};

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[type] || colors.cyan;
}

function getStatusColor(color: string): string {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[color] || colors.blue;
}

type CategoryFilter = 'all' | 'originals' | 'covers' | 'remixes';

export default function LibraryPage() {
  // ── Catalog state ──
  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  // ── My Songs state ──
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [genLoading, setGenLoading] = useState(true);
  const [genError, setGenError] = useState<string | null>(null);
  const [lyricsModal, setLyricsModal] = useState<Generation | null>(null);

  // ── Fetch catalog tracks ──
  useEffect(() => {
    const fetchTracks = async () => {
      setTracksLoading(true);
      try {
        const res = await fetch('/api/tracks');
        const data = await res.json();
        if (data.tracks) setTracks(data.tracks);
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
      } finally {
        setTracksLoading(false);
      }
    };
    fetchTracks();
  }, []);

  // ── Fetch generations ──
  const fetchGenerations = useCallback(async () => {
    try {
      setGenLoading(true);
      const res = await fetch('/api/studio/generations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      setGenerations(data.generations);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setGenLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  // ── Catalog filters ──
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      !search ||
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'all' ||
      (category === 'originals' && track.style?.toLowerCase().includes('original')) ||
      (category === 'covers' && track.style?.toLowerCase().includes('cover')) ||
      (category === 'remixes' && track.style?.toLowerCase().includes('remix'));

    return matchesSearch && (category === 'all' || matchesCategory);
  });

  const styles = Array.from(new Set(tracks.map((t) => t.style).filter(Boolean)));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bg-BG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Библиотека</h1>
            <p className="text-gray-400">Каталог, твоите песни и харесани</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="catalog" className="space-y-6">
          <TabsList>
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="my-songs">Моите Песни</TabsTrigger>
            <TabsTrigger value="liked">Харесани</TabsTrigger>
          </TabsList>

          {/* ══════════════ КАТАЛОГ ══════════════ */}
          <TabsContent value="catalog">
            {/* Search & Category Filter */}
            <Card variant="glass" padding="md" className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Търси по заглавие или изпълнител..."
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: 'all' as CategoryFilter, label: 'Всички' },
                      { value: 'originals' as CategoryFilter, label: 'Originals' },
                      { value: 'covers' as CategoryFilter, label: 'Covers' },
                      { value: 'remixes' as CategoryFilter, label: 'Remixes' },
                    ]).map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          category === cat.value
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="md">
              {tracksLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <TrackList tracks={filteredTracks} />
              )}
            </Card>
          </TabsContent>

          {/* ══════════════ МОИТЕ ПЕСНИ ══════════════ */}
          <TabsContent value="my-songs">
            {genLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            )}

            {genError && !genLoading && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-6">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span>{genError}</span>
              </div>
            )}

            {!genLoading && !genError && generations.length === 0 && (
              <Card variant="glass" padding="lg">
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Music className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    Все още нямаш генерации
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Създай първата си песен!
                  </p>
                  <Link href="/create">
                    <Button
                      variant="primary"
                      leftIcon={<Wand2 className="w-4 h-4" />}
                    >
                      Създай Песен
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {!genLoading && generations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.map((gen) => {
                  const typeConfig = TYPE_CONFIG[gen.type] || TYPE_CONFIG.music;
                  const statusConfig = STATUS_CONFIG[gen.status] || STATUS_CONFIG.pending;

                  return (
                    <Card key={gen.id} variant="glass" padding="md" className="flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(typeConfig.color)}`}>
                            {typeConfig.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(statusConfig.color)}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-medium text-white mb-1 line-clamp-2">
                        {gen.topic || gen.style || gen.type}
                      </h3>

                      {gen.style && (
                        <p className="text-xs text-gray-500 mb-1">
                          Стил: {gen.style}
                        </p>
                      )}
                      {gen.mood && (
                        <p className="text-xs text-gray-500 mb-2">
                          Настроение: {gen.mood}
                        </p>
                      )}

                      <p className="text-xs text-gray-600 mt-auto pt-2 border-t border-white/[0.05]">
                        {formatDate(gen.created_at)} &middot; {gen.credits_used} кр.
                      </p>

                      <div className="flex gap-2 mt-3">
                        {gen.type === 'lyrics' && gen.status === 'completed' && gen.lyrics && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setLyricsModal(gen)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                            className="flex-1"
                          >
                            Виж Текст
                          </Button>
                        )}
                        {gen.type !== 'lyrics' && gen.status === 'completed' && gen.audio_url && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const audio = new Audio(gen.audio_url!);
                                audio.play();
                              }}
                              leftIcon={<Play className="w-3.5 h-3.5" />}
                              className="flex-1"
                            >
                              Пусни
                            </Button>
                            <a href={gen.audio_url} download>
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Download className="w-3.5 h-3.5" />}
                              >
                                Изтегли
                              </Button>
                            </a>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ══════════════ ХАРЕСАНИ ══════════════ */}
          <TabsContent value="liked">
            <Card variant="glass" padding="lg">
              <div className="text-center py-16">
                <div className="p-4 bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Скоро!</h3>
                <p className="text-gray-400">
                  Тук ще можеш да запазваш любимите си песни.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Lyrics Modal */}
        {lyricsModal && (
          <Modal
            isOpen={!!lyricsModal}
            onClose={() => setLyricsModal(null)}
            title={lyricsModal.topic || 'Текст'}
          >
            <div className="space-y-4">
              {lyricsModal.style && (
                <Badge variant="purple">{lyricsModal.style}</Badge>
              )}
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono bg-black/20 p-4 rounded-xl max-h-[60vh] overflow-y-auto">
                {lyricsModal.lyrics}
              </pre>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
