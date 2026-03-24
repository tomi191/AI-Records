'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Upload,
  Music,
} from 'lucide-react';
import type { Track } from '@/lib/supabase/types';

const STYLE_OPTIONS = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'Electronic',
  'R&B',
  'Чалга',
  'Фолк',
  'Балада',
];

const CATEGORY_OPTIONS = [
  { value: 'original', label: 'Original' },
  { value: 'cover', label: 'Cover' },
  { value: 'remix', label: 'Remix' },
  { value: 'ai_generated', label: 'AI Generated' },
];

export default function EditTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('original');
  const [style, setStyle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [publishAt, setPublishAt] = useState('');

  const fetchTrack = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tracks?search=&limit=1&offset=0`);
      // We need to fetch by ID - use the list endpoint with a workaround or direct fetch
      // Actually let's fetch all and find, but better to use the PATCH endpoint's GET-like behavior
      // Instead, let's just fetch the track data via a dedicated approach
      const allRes = await fetch(`/api/admin/tracks?limit=200`);
      const allData = await allRes.json();
      if (!allRes.ok) throw new Error(allData.error);
      const found = allData.tracks.find((t: Track) => t.id === id);
      if (!found) throw new Error('Песента не е намерена');
      setTrack(found);
      // Populate form
      setTitle(found.title);
      setArtist(found.artist);
      setDescription(found.description || '');
      setCategory(found.category || 'original');
      setStyle(found.style || '');
      setTags(found.tags || []);
      setLyrics(found.lyrics || '');
      setCoverPreview(found.cover_url || null);
      setYoutubeUrl(found.youtube_url || '');
      setSpotifyUrl(found.spotify_url || '');
      setIsFeatured(found.is_featured);
      setIsPublic(found.is_public);
      setPublishAt(
        found.publish_at
          ? new Date(found.publish_at).toISOString().slice(0, 16)
          : ''
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      setCoverBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        artist: artist.trim(),
        description: description.trim() || null,
        category,
        style: style || null,
        tags,
        lyrics: lyrics.trim() || null,
        youtube_url: youtubeUrl.trim() || null,
        spotify_url: spotifyUrl.trim() || null,
        is_featured: isFeatured,
        is_public: isPublic,
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      };

      if (coverBase64) {
        body.cover_image = coverBase64;
      }

      const res = await fetch(`/api/admin/tracks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTrack(data.track);
      setCoverBase64(null); // Reset so we don't re-upload
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при запис');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tracks/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Грешка при изтриване');
      router.push('/admin/tracks');
    } catch {
      setError('Грешка при изтриване на песента');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error || 'Песента не е намерена'}</p>
        </div>
        <Link
          href="/admin/tracks"
          className="inline-flex items-center gap-2 mt-4 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад към списъка
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tracks"
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Редактиране</h1>
            <p className="text-gray-400 text-sm">{track.title}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:text-white hover:bg-red-600 border border-red-500/30 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Изтрий
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400 text-sm">Промените са запазени успешно!</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Заглавие *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Artist */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Артист *
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Кратко описание на песента..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-y"
          />
        </div>

        {/* Category & Style row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Стил
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="">Без стил</option>
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Тагове
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm border border-purple-500/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Въведете таг и натиснете Enter..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Lyrics */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Текст на песента
          </label>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={10}
            placeholder="Въведете текста на песента..."
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-y font-mono text-sm"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Обложка
          </label>
          <div className="flex items-start gap-4">
            {coverPreview ? (
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-gray-600" />
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-gray-800 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              Избери изображение
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* YouTube & Spotify URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Spotify URL
            </label>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label htmlFor="featured" className="text-sm text-gray-300">
              Покажи на началната страница (Featured)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="public"
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
            />
            <label htmlFor="public" className="text-sm text-gray-300">
              Публична песен (видима за всички)
            </label>
          </div>
        </div>

        {/* Scheduled Publish */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Планирано публикуване
          </label>
          <input
            type="datetime-local"
            value={publishAt}
            onChange={(e) => setPublishAt(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            Оставете празно за незабавно публикуване
          </p>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving || !title.trim() || !artist.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Запазване...' : 'Запази промените'}
          </button>
          <Link
            href="/admin/tracks"
            className="flex items-center gap-2 px-6 py-3 bg-white/[0.05] border border-gray-800 text-gray-300 hover:text-white rounded-xl transition-colors"
          >
            Отказ
          </Link>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Изтриване на песен
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Сигурни ли сте, че искате да изтриете &ldquo;{track.title}&rdquo;?
              Това действие е необратимо.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
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
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Изтрий завинаги
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
