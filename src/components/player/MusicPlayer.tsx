'use client';

import { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music2,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { Slider } from '@/components/ui';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [localProgress, setLocalProgress] = useState(0);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    duration,
    isLooping,
    isShuffled,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    setProgress,
    setDuration,
    toggleLoop,
    toggleShuffle,
    playNext,
    playPrevious,
  } = usePlayerStore();

  // Sync audio element with store state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => pause());
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, pause]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle time update
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setLocalProgress(audio.currentTime);
    setProgress(audio.currentTime);
  };

  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(audio.duration);
  };

  // Handle track end
  const handleEnded = () => {
    playNext();
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setLocalProgress(newTime);
    setProgress(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Music2 className="w-5 h-5" />
          <span>Select a track to play</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-900/95 backdrop-blur-xl border-t border-white/[0.08] z-50">
      <audio
        ref={audioRef}
        src={currentTrack.audio_url || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        loop={isLooping}
      />

      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-4 w-64 flex-shrink-0">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600/40 to-cyan-600/40 rounded-lg flex items-center justify-center">
            {isPlaying ? (
              <div className="audio-visualizer">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="audio-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            ) : (
              <Music2 className="w-6 h-6 text-white/60" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{currentTrack.title}</p>
            <p className="text-sm text-gray-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                isShuffled
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={playPrevious}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={playNext}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-lg transition-colors ${
                isLooping
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xl flex items-center gap-3">
            <span className="text-xs text-gray-500 w-10 text-right">
              {formatDuration(localProgress)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={localProgress}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(147, 51, 234) 0%, rgb(6, 182, 212) ${
                  (localProgress / (duration || 1)) * 100
                }%, rgba(255,255,255,0.1) ${(localProgress / (duration || 1)) * 100}%)`,
              }}
            />
            <span className="text-xs text-gray-500 w-10">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-32 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
