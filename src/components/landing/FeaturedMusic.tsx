'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music2,
  Download,
  Headphones,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { formatDuration, formatNumber } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  style: string;
  audio_url: string;
  cover_url: string | null;
  play_count: number;
  download_count: number;
  duration: number | null;
}

export default function FeaturedMusic() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [playCountIncremented, setPlayCountIncremented] = useState<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const track = tracks[currentIndex] ?? null;

  // Fetch featured tracks on mount
  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch('/api/tracks?featured=true');
        if (!res.ok) return;
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
          setLoaded(true);
        }
      } catch {
        // Silently fail — component will render nothing
      }
    }
    fetchTracks();
  }, []);

  // Increment play count
  const incrementPlayCount = useCallback(
    async (trackId: string) => {
      if (playCountIncremented.has(trackId)) return;
      setPlayCountIncremented((prev) => new Set(prev).add(trackId));
      try {
        await fetch('/api/tracks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId, action: 'play' }),
        });
        // Update local count
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId ? { ...t, play_count: t.play_count + 1 } : t
          )
        );
      } catch {
        // Non-critical
      }
    },
    [playCountIncremented]
  );

  // Handle play/pause
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        incrementPlayCount(track.id);
      } catch {
        // Browser may block autoplay
      }
    }
  }, [isPlaying, track, incrementPlayCount]);

  // Switch track
  const switchTrack = useCallback(
    (index: number) => {
      if (index === currentIndex && tracks.length > 0) return;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
      setCurrentTime(0);
      setDuration(0);
      setCurrentIndex(index);
    },
    [currentIndex, tracks.length]
  );

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    switchTrack(nextIndex);
  }, [currentIndex, tracks.length, switchTrack]);

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) return;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    switchTrack(prevIndex);
  }, [currentIndex, tracks.length, switchTrack]);

  // Auto-play next on track end
  const handleTrackEnd = useCallback(() => {
    setIsPlaying(false);
    if (tracks.length > 1) {
      const nextIndex = (currentIndex + 1) % tracks.length;
      setCurrentIndex(nextIndex);
      setCurrentTime(0);
      setDuration(0);
      // Will auto-play via the effect below
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().then(() => {
            setIsPlaying(true);
            incrementPlayCount(tracks[nextIndex].id);
          }).catch(() => {});
        }
      }, 100);
    }
  }, [currentIndex, tracks, incrementPlayCount]);

  // Click on progress bar to seek
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar || !duration) return;

      const rect = bar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration]
  );

  // Download handler
  const handleDownload = useCallback(async () => {
    if (!track) return;

    // Increment download count
    try {
      await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, action: 'download' }),
      });
      setTracks((prev) =>
        prev.map((t) =>
          t.id === track.id
            ? { ...t, download_count: t.download_count + 1 }
            : t
        )
      );
    } catch {
      // Non-critical
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = track.audio_url;
    link.download = `${track.artist} - ${track.title}.mp3`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [track]);

  // Render nothing if no tracks loaded
  if (!loaded || tracks.length === 0) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="music" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-full">
            <Headphones className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-400">AI-Records Music</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Слушай Нашата Музика
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Създадена с AI, вдъхновена от България
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left - Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-[60px]" />

              {/* Hidden Audio Element */}
              {track && (
                <audio
                  ref={audioRef}
                  src={track.audio_url}
                  preload="metadata"
                  onTimeUpdate={(e) =>
                    setCurrentTime((e.target as HTMLAudioElement).currentTime)
                  }
                  onLoadedMetadata={(e) =>
                    setDuration((e.target as HTMLAudioElement).duration)
                  }
                  onEnded={handleTrackEnd}
                />
              )}

              {/* Current Track Display */}
              <div className="relative flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Music2 className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-white truncate">
                    {track?.title}
                  </h3>
                  <p className="text-gray-400 truncate">{track?.artist}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {track?.style}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="relative h-2 bg-white/[0.08] rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progress}%`, marginLeft: '-7px' }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={handlePrev}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-colors"
                  aria-label="Предишна песен"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
                  aria-label={isPlaying ? 'Пауза' : 'Пусни'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={handleNext}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-colors"
                  aria-label="Следваща песен"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Stats & Download */}
              <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Play className="w-3.5 h-3.5" />
                    <span>{formatNumber(track?.play_count ?? 0)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Download className="w-3.5 h-3.5" />
                    <span>{formatNumber(track?.download_count ?? 0)}</span>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Свали MP3
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Right - Track List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Списък с песни
              </h3>
              <span className="text-sm text-gray-500">
                ({tracks.length} {tracks.length === 1 ? 'песен' : 'песни'})
              </span>
            </div>

            <div className="space-y-3">
              {tracks.map((t, index) => (
                <button
                  key={t.id}
                  onClick={() => switchTrack(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    currentIndex === index
                      ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20'
                      : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Track number */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {currentIndex === index && isPlaying ? (
                      <div className="flex items-center gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-purple-500 to-cyan-500 rounded-full animate-pulse"
                            style={{
                              height: `${12 + (i % 2) * 6}px`,
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                  </div>

                  {/* Track icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600/40 to-cyan-600/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music2 className="w-4 h-4 text-white" />
                  </div>

                  {/* Track info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-white truncate">{t.title}</p>
                    <p className="text-sm text-gray-500 truncate">{t.artist}</p>
                  </div>

                  {/* Style badge */}
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.08]">
                    {t.style}
                  </span>

                  {/* Play count */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Play className="w-3 h-3" />
                    <span>{formatNumber(t.play_count)}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
