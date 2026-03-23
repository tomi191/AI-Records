'use client';

import { Play, Pause, Music2, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/store/playerStore';
import type { Track } from '@/lib/supabase/types';

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const { currentTrack, isPlaying, setCurrentTrack, play, pause, setQueue } = usePlayerStore();

  const handleTrackClick = (track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      setCurrentTrack(track);
      // Set remaining tracks as queue
      setQueue(tracks.slice(index + 1));
      play();
    }
  };

  if (tracks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.03] rounded-full mb-4">
          <Music2 className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-2">No tracks found</p>
        <p className="text-sm text-gray-600">
          Generate some music in the Studio to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track, index) => {
        const isCurrentTrack = currentTrack?.id === track.id;
        const isCurrentPlaying = isCurrentTrack && isPlaying;

        return (
          <button
            key={track.id}
            onClick={() => handleTrackClick(track, index)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group ${
              isCurrentTrack
                ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20'
                : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05] hover:border-white/[0.05]'
            }`}
          >
            {/* Play Button / Track Number */}
            <div
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg ${
                isCurrentTrack
                  ? 'bg-gradient-to-br from-purple-500 to-cyan-500'
                  : 'bg-white/[0.05] group-hover:bg-white/[0.1]'
              }`}
            >
              {isCurrentPlaying ? (
                <div className="audio-visualizer">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="audio-bar !bg-white"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              ) : (
                <span
                  className={`text-sm ${
                    isCurrentTrack
                      ? 'text-white hidden group-hover:block'
                      : 'text-gray-500 group-hover:hidden'
                  }`}
                >
                  {index + 1}
                </span>
              )}
              {!isCurrentPlaying && (
                <Play
                  className={`w-4 h-4 ${
                    isCurrentTrack
                      ? 'text-white'
                      : 'text-white hidden group-hover:block'
                  }`}
                />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 text-left">
              <p
                className={`font-medium truncate ${
                  isCurrentTrack ? 'text-purple-300' : 'text-white'
                }`}
              >
                {track.title}
              </p>
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            </div>

            {/* Style Badge */}
            {track.style && (
              <span className="hidden sm:inline-flex px-2.5 py-1 text-xs text-gray-400 bg-white/[0.05] rounded-full">
                {track.style}
              </span>
            )}

            {/* Duration */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{track.duration ? formatDuration(track.duration) : '--:--'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
