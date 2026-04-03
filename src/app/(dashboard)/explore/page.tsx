'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Music,
  Clock,
  Play,
  Pause,
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

const JUMP_BACK_IN = [
  { label: 'Харесани', icon: Heart, href: '/library?tab=liked', gradient: 'from-pink-600 to-rose-700' },
  { label: 'Моите Песни', icon: Music, href: '/library?tab=my', gradient: 'from-purple-600 to-violet-700' },
  { label: 'Наскоро Слушани', icon: Clock, href: '/library?tab=recent', gradient: 'from-cyan-600 to-blue-700' },
];

function LargeTrackCard({ track, allTracks, index }: { track: Track; allTracks: Track[]; index: number }) {
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
      className="group text-left focus:outline-none"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-white/[0.05]">
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={track.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40">
            <Music className="w-10 h-10 text-gray-600" />
          </div>
        )}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
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

export default function ExplorePage() {
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [coverTracks, setCoverTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, allRes] = await Promise.all([
          fetch('/api/tracks?featured=true'),
          fetch('/api/tracks?limit=50'),
        ]);
        const featuredData = await featuredRes.json();
        const allData = await allRes.json();

        if (featuredData.tracks) setFeaturedTracks(featuredData.tracks);
        if (allData.tracks) {
          const covers = (allData.tracks as Track[]).filter(
            (t) => t.category === 'cover' || t.category === 'remix'
          );
          setCoverTracks(covers);
        }
      } catch (err) {
        console.error('Failed to fetch tracks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-3xl font-bold text-white tracking-tight">
          Explore
        </h1>

        {/* Section 1 — Jump Back In */}
        <section>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {JUMP_BACK_IN.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r ${item.gradient} hover:scale-[1.02] transition-transform shadow-lg min-w-[180px]`}
              >
                <item.icon className="w-5 h-5 text-white/80" />
                <span className="text-white font-semibold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2 — Genres (full grid) */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">&#x1F3B5;</span> Жанрове
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GENRES.map((genre) => (
              <Link
                key={genre.name}
                href={`/library?genre=${encodeURIComponent(genre.name)}`}
                className={`h-[100px] rounded-xl bg-gradient-to-br ${genre.gradient} flex items-end p-4 hover:scale-[1.03] transition-transform shadow-lg`}
              >
                <span className="text-white font-bold text-base drop-shadow-md">
                  {genre.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3 — Staff Picks */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {featuredTracks.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-lg">&#x2B50;</span> Избрани от AI-Records
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredTracks.map((track, i) => (
                    <LargeTrackCard key={track.id} track={track} allTracks={featuredTracks} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Section 4 — Covers & Remixes */}
            {coverTracks.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-lg">&#x1F3AD;</span> Covers &amp; Remixes
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {coverTracks.map((track, i) => (
                    <LargeTrackCard key={track.id} track={track} allTracks={coverTracks} index={i} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </div>
  );
}
