'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Library,
  TrendingUp,
  Clock,
  Music,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { TrackList } from '@/components/player';
import { useUserStore } from '@/store/userStore';
import type { Track } from '@/lib/supabase/types';

export default function HomePage() {
  const { user } = useUserStore();
  const [featuredTracks, setFeaturedTracks] = useState<Track[]>([]);
  const [latestTracks, setLatestTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Добре дошъл!
          </h1>
          <p className="text-gray-400 text-lg">
            Какво ще създадеш днес?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/create">
            <Card variant="glass" padding="md" className="group hover:border-purple-500/30 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Създай Песен</h3>
                  <p className="text-sm text-gray-400">Генерирай музика с AI</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link href="/library">
            <Card variant="glass" padding="md" className="group hover:border-cyan-500/30 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl group-hover:scale-105 transition-transform">
                  <Library className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Библиотека</h3>
                  <p className="text-sm text-gray-400">Разгледай каталога</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </Card>
          </Link>
        </div>

        {/* User Stats */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="glass" padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Кредити</p>
                  <p className="text-xl font-bold text-white">{user.credits}</p>
                </div>
              </div>
            </Card>

            <Card variant="glass" padding="md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">План</p>
                  <p className="text-xl font-bold text-white capitalize">{user.subscription_tier || 'free'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trending Section */}
        {featuredTracks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Trending</h2>
            </div>
            <Card variant="glass" padding="md">
              <TrackList tracks={featuredTracks} />
            </Card>
          </section>
        )}

        {/* Latest Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Нови</h2>
          </div>
          <Card variant="glass" padding="md">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : latestTracks.length > 0 ? (
              <TrackList tracks={latestTracks} />
            ) : (
              <div className="text-center py-12">
                <Music className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Все още няма песни в каталога</p>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}
