'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Trash2,
  Edit3,
  Star,
  StarOff,
  Music,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Track } from '@/lib/supabase/types';

const CATEGORIES = [
  { key: 'all', label: 'Всички' },
  { key: 'original', label: 'Originals' },
  { key: 'cover', label: 'Covers' },
  { key: 'remix', label: 'Remixes' },
  { key: 'ai_generated', label: 'AI Generated' },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  original: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cover: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  remix: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  ai_generated: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  original: 'Original',
  cover: 'Cover',
  remix: 'Remix',
  ai_generated: 'AI',
};

function getTrackStatus(track: Track): { label: string; className: string } {
  if (track.publish_at && new Date(track.publish_at) > new Date()) {
    return {
      label: 'Планирана',
      className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
  }
  if (!track.is_public) {
    return {
      label: 'Чернова',
      className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
  }
  return {
    label: 'Публикувана',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
}

const PAGE_SIZE = 20;

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));

      const res = await fetch(`/api/admin/tracks?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTracks(data.tracks);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(0);
  };

  const handleToggleFeatured = async (track: Track) => {
    try {
      const res = await fetch(`/api/admin/tracks/${track.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !track.is_featured }),
      });
      if (!res.ok) throw new Error('Грешка');
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id ? { ...t, is_featured: !t.is_featured } : t
        )
      );
    } catch {
      setError('Грешка при промяна на featured статуса');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tracks/${deleteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Грешка при изтриване');
      setDeleteId(null);
      fetchTracks();
    } catch {
      setError('Грешка при изтриване на песента');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Управление на песни
          </h1>
          <p className="text-gray-400">
            {total} песни общо
          </p>
        </div>
        <Link
          href="/admin/upload"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Music className="w-4 h-4" />
          Качи нова
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              category === cat.key
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Търсене по заглавие или артист..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-white/[0.05] border border-gray-800 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm"
        >
          Търси
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Няма намерени песни</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/[0.08]">
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Песен
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Стил
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                    Слушания
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                    Изтегляния
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                    Featured
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-4 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {tracks.map((track) => {
                  const status = getTrackStatus(track);
                  return (
                    <tr
                      key={track.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Track info with cover */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden">
                            {track.cover_url ? (
                              <Image
                                src={track.cover_url}
                                alt={track.title}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm truncate max-w-[200px]">
                              {track.title}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            CATEGORY_COLORS[track.category] || CATEGORY_COLORS.original
                          }`}
                        >
                          {CATEGORY_LABELS[track.category] || track.category}
                        </span>
                      </td>
                      {/* Style */}
                      <td className="px-4 py-4 text-gray-400 text-sm">
                        {track.style || '--'}
                      </td>
                      {/* Plays */}
                      <td className="px-4 py-4 text-gray-400 text-sm text-center">
                        {track.play_count}
                      </td>
                      {/* Downloads */}
                      <td className="px-4 py-4 text-gray-400 text-sm text-center">
                        {track.download_count}
                      </td>
                      {/* Featured toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(track)}
                          className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                          title={
                            track.is_featured
                              ? 'Премахни от featured'
                              : 'Направи featured'
                          }
                        >
                          {track.is_featured ? (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/tracks/${track.id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                            title="Редактирай"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(track.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Изтрий"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Страница {page + 1} от {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-gray-800 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-gray-800 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Напред
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Изтриване на песен
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Сигурни ли сте, че искате да изтриете тази песен? Това действие е
              необратимо и ще изтрие и аудио файла.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/[0.05] border border-gray-700 transition-colors text-sm"
              >
                Отказ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {deleting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
