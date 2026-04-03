'use client';

import { Music, Play, Pause, Download, RefreshCw, Disc3, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/lib/supabase/types';
import Link from 'next/link';

export interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
  compact?: boolean;
}

export default function TrackCard({ track, onPlay, compact = false }: TrackCardProps) {
  const { currentTrack, isPlaying, setCurrentTrack, play, pause, setQueue } = usePlayerStore();

  const isActive = currentTrack?.id === track.id;
  const isCurrentPlaying = isActive && isPlaying;

  const handlePlay = () => {
    if (onPlay) {
      onPlay(track);
      return;
    }
    if (isActive) {
      isPlaying ? pause() : play();
    } else {
      setCurrentTrack(track);
      setQueue([]);
      play();
    }
  };

  // Determine version badge from tags or style
  const versionBadge = track.tags?.find(t => t.startsWith('v')) || (track.category === 'ai_generated' ? 'v5' : null);

  return (
    <div
      className={`
        group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200
        ${isActive
          ? 'bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border-l-2 border-l-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.08)]'
          : 'hover:bg-white/[0.03] border-l-2 border-l-transparent'
        }
        ${compact ? 'p-2' : 'p-3'}
      `}
    >
      {/* Cover Art */}
      <button
        onClick={handlePlay}
        className={`
          relative flex-shrink-0 rounded-lg overflow-hidden
          ${compact ? 'w-10 h-10' : 'w-[60px] h-[60px]'}
        `}
      >
        {track.cover_url ? (
          <img
            src={track.cover_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center">
            <Music className={compact ? 'w-4 h-4 text-gray-500' : 'w-6 h-6 text-gray-500'} />
          </div>
        )}
        {/* Play overlay */}
        <div className={`
          absolute inset-0 flex items-center justify-center bg-black/40
          ${isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          transition-opacity duration-200
        `}>
          {isCurrentPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </div>
        {/* Duration overlay on cover */}
        {!compact && track.duration && (
          <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/70 text-gray-300 px-1 rounded">
            {formatDuration(track.duration)}
          </span>
        )}
      </button>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-white truncate ${compact ? 'text-sm' : 'text-sm'}`}>
            {track.title}
          </h4>
          {versionBadge && (
            <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
              {versionBadge}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 truncate mt-0.5">
          {track.artist}
        </p>

        {!compact && (
          <div className="flex items-center gap-3 mt-1.5">
            {/* Play count */}
            {track.play_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Play className="w-3 h-3" />
                {track.play_count}
              </span>
            )}
            {/* Download count as likes proxy */}
            {track.download_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <ThumbsUp className="w-3 h-3" />
                {track.download_count}
              </span>
            )}
            {/* Style pill */}
            {track.style && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.06] truncate max-w-[120px]">
                {track.style}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Duration (compact) */}
      {compact && track.duration && (
        <span className="text-xs text-gray-500 flex-shrink-0">
          {formatDuration(track.duration)}
        </span>
      )}

      {/* Action Buttons */}
      {!compact && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {track.audio_url && (
            <a
              href={track.audio_url}
              download
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.08] transition-colors"
              title="Изтегли"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            href={`/create?tab=extend&taskId=${track.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Удължи"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/create?tab=cover"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Cover"
          >
            <Disc3 className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
