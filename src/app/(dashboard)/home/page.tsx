'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Play,
  Pause,
  Music,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatNumber } from '@/lib/utils';
import type { Track } from '@/lib/supabase/types';

const GENRES = [
  { name: 'Pop', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Чалга', gradient: 'from-orange-500 to-yellow-500' },
  { name: 'Rock', gradient: 'from-gray-500 to-gray-900' },
  { name: 'Hip-Hop', gradient: 'from-red-500 to-orange-500' },
  { name: 'Electronic', gradient: 'from-cyan-400 to-blue-600' },
  { name: 'R&B', gradient: 'from-pink-500 to-purple-600' },
  { name: 'Фолк', gradient: 'from-green-500 to-teal-600' },
  { name: 'Балада', gradient: 'from-blue-500 to-indigo-600' },
];

function TrackCard({ track, allTracks, index }: { track: Track; allTracks: Track[]; index: number }) {
  const { currentTrack, isPlaying, setCurrentTrack, play, pause, setQueue } = usePlayerStore();
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrentTrack && isPlaying;

  const handleClick = () => {
    if (isCurrentTrack) {
      isPlaying ? pause() : play();
    } else {
      setCurrentTrack(track);
      setQueue(allTracks.slice(index + 1));
      play();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group flex-shrink-0 w-[160px] text-left focus:outline-none"
    >
      <div className="relative w-[160px] h-[160px] rounded-xl overflow-hidden mb-2 bg-white/[0.05]">
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={track.title}
            fill
            className="object-cover"
            sizes="160px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40">
            <Music className="w-8 h-8 text-gray-600" />
          </div>
        )}
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 text-gray-900" />
            ) : (
              <Play className="w-5 h-5 text-gray-900 ml-0.5" />
            )}
          </div>
        </div>
      </div>
      <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-purple-300' : 'text-white'}`}>
        {track.title}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <p className="text-xs text-gray-500 truncate flex-1">{track.artist}</p>
        {track.play_count > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-gray-600 flex-shrink-0">
            <Headphones className="w-3 h-3" />
            {formatNumber(track.play_count)}
          </span>
        )}
      </div>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [latestTracks, setLatestTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, latestRes] = await Promise.all([
          fetch('/api/tracks?featured=true'),
          fetch('/api/tracks?limit=6'),
        ]);
        const featuredData = await featuredRes.json();
        const latestData = await latestRes.json();

        if (featuredData.tracks) setFeaturedTracks(featuredData.tracks);
        if (latestData.tracks) setLatestTracks(latestData.tracks.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const handleCreate = () => {
    if (!prompt.trim()) {
      router.push('/create');
      return;
    }
    router.push(`/create?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleTextareaInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Section 1 — Hero with inline prompt */}
        <section className="text-center pt-4 pb-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
            Създай Българска Музика
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-2 flex items-end gap-2 shadow-lg shadow-purple-500/5">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onInput={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Опиши песента, която искаш..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none px-4 py-3 text-base focus:outline-none overflow-hidden"
              />
              <button
                onClick={handleCreate}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium rounded-xl transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Създай
              </button>
            </div>
          </div>
        </section>

        {/* Section 2 — Trending */}
        {featuredTracks.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-lg">&#x1F525;</span> Trending
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {featuredTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} allTracks={featuredTracks} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Section 3 — Genres */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-lg">&#x1F3B5;</span> Жанрове
            </h2>
            <Link
              href="/explore"
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Виж всички
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {GENRES.map((genre) => (
              <Link
                key={genre.name}
                href={`/explore?genre=${encodeURIComponent(genre.name)}`}
                className={`flex-shrink-0 w-[160px] h-[100px] rounded-xl bg-gradient-to-br ${genre.gradient} flex items-end p-4 hover:scale-[1.03] transition-transform shadow-lg`}
              >
                <span className="text-white font-bold text-base drop-shadow-md">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 4 — Latest */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">&#x2B50;</span> Нови
          </h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : latestTracks.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {latestTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} allTracks={latestTracks} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Все още няма песни в каталога</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
