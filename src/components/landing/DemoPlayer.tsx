'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
} from 'lucide-react';
import { Card } from '@/components/ui';

// Demo tracks data
const demoTracks = [
  {
    id: '1',
    title: 'Без посока',
    artist: 'Sarys',
    style: 'Pop',
    duration: '3:24',
    cover: null,
  },
  {
    id: '2',
    title: 'Изгубени дни',
    artist: 'Sarys',
    style: 'Ballad',
    duration: '4:12',
    cover: null,
  },
  {
    id: '3',
    title: 'Нощен копнеж',
    artist: 'AI-Records',
    style: 'R&B',
    duration: '3:45',
    cover: null,
  },
];

export default function DemoPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const track = demoTracks[currentTrack];

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % demoTracks.length);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + demoTracks.length) % demoTracks.length);
  };

  return (
    <section id="demo" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-full">
              <Music2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Чуй AI-Records</span>
            </div>
            <h2 className="text-headline font-bold text-white mb-4">
              Чуй Какво Можем да Създадем
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Слушай демо песни създадени с AI-Records. Тези песни са генерирани
              с нашата платформа за българска музика.
            </p>

            {/* Track List */}
            <div className="space-y-3">
              {demoTracks.map((t, index) => (
                <button
                  key={t.id}
                  onClick={() => setCurrentTrack(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    currentTrack === index
                      ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20'
                      : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600/40 to-cyan-600/40 rounded-lg flex items-center justify-center">
                    <Music2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">{t.title}</p>
                    <p className="text-sm text-gray-500">{t.artist}</p>
                  </div>
                  <span className="text-sm text-gray-500">{t.duration}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right - Player */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card variant="gradient" padding="lg" className="relative overflow-hidden">
              {/* Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-[60px]" />

              {/* Album Art */}
              <div className="relative mb-8">
                <div className="aspect-square max-w-[300px] mx-auto bg-gradient-to-br from-purple-600/40 to-cyan-600/40 rounded-2xl flex items-center justify-center">
                  <div className="audio-visualizer">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="audio-bar"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          opacity: isPlaying ? 1 : 0.3,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Track Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{track.title}</h3>
                <p className="text-gray-400">{track.artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="player-progress h-1.5">
                  <div
                    className="player-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>1:12</span>
                  <span>{track.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrev}
                  className="p-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-full transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
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
                >
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <div className="w-24 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
