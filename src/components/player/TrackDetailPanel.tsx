'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Headphones,
  Pencil,
  ArrowRightLeft,
  Mic2,
  Music2,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

/** Category label map (Bulgarian) */
const categoryLabels: Record<string, string> = {
  original: 'Оригинал',
  cover: 'Кавър',
  remix: 'Ремикс',
  ai_generated: 'AI Генерирано',
};

export default function TrackDetailPanel() {
  const { currentTrack, isPlaying } = usePlayerStore();

  if (!currentTrack) return null;

  const tags =
    currentTrack.style
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

  const allTags = [
    ...tags,
    ...(currentTrack.tags?.filter((t) => !tags.includes(t)) ?? []),
  ];

  return (
    <aside
      className="
        hidden lg:flex flex-col
        fixed right-0 top-16 bottom-24 w-[350px]
        bg-gray-900/95 backdrop-blur-xl
        border-l border-white/[0.06]
        z-40
        animate-in slide-in-from-right duration-300
      "
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
        {/* ---- Cover Art ---- */}
        <div className="relative w-[280px] h-[280px] mx-auto rounded-xl overflow-hidden shadow-2xl shadow-black/40">
          {currentTrack.cover_url ? (
            <Image
              src={currentTrack.cover_url}
              alt={currentTrack.title}
              fill
              className="object-cover"
              sizes="280px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600/40 to-cyan-600/40 flex items-center justify-center">
              <Music2 className="w-16 h-16 text-white/30" />
            </div>
          )}

          {/* Playing indicator overlay */}
          {isPlaying && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
              </span>
              <span className="text-xs font-medium text-white">
                Изпълнява се
              </span>
            </div>
          )}
        </div>

        {/* ---- Play count & likes ---- */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Headphones className="w-4 h-4" />
            {(currentTrack.play_count ?? 0).toLocaleString('bg-BG')}
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4" />
            {(currentTrack.download_count ?? 0).toLocaleString('bg-BG')}
          </span>
        </div>

        {/* ---- Title & Artist ---- */}
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {currentTrack.title}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{currentTrack.artist}</p>
        </div>

        {/* ---- Caption placeholder ---- */}
        <div className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer hover:text-gray-300 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
          <span>Добави описание...</span>
        </div>

        {/* ---- Category badge ---- */}
        {currentTrack.category && (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
            {categoryLabels[currentTrack.category] ?? currentTrack.category}
          </span>
        )}

        {/* ---- Divider ---- */}
        <div className="border-t border-white/[0.06]" />

        {/* ---- Style tags ---- */}
        {allTags.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs rounded-full border border-white/[0.1] text-gray-300 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="border-t border-white/[0.06]" />
          </>
        )}

        {/* ---- Lyrics ---- */}
        {currentTrack.lyrics && (
          <>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Текст
              </p>
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed max-h-[340px] overflow-y-auto custom-scrollbar pr-2">
                {currentTrack.lyrics}
              </pre>
            </div>
            <div className="border-t border-white/[0.06]" />
          </>
        )}

        {/* ---- Action buttons ---- */}
        <div className="space-y-2.5 pb-2">
          <Link
            href={`/create?remix=${currentTrack.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Ремикс / Редакция
          </Link>
          <div className="flex gap-2.5">
            <Link
              href={`/create/extend?track=${currentTrack.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 text-sm font-medium rounded-xl border border-white/[0.08] transition-all"
            >
              <Play className="w-4 h-4" />
              Удължи
            </Link>
            <Link
              href={`/create/cover?track=${currentTrack.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 text-sm font-medium rounded-xl border border-white/[0.08] transition-all"
            >
              <Mic2 className="w-4 h-4" />
              Кавър
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
