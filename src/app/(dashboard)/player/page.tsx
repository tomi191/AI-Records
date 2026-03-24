'use client';

import { useEffect, useState } from 'react';
import { Music2, Filter, Search } from 'lucide-react';
import { Card, Input, Badge } from '@/components/ui';
import { TrackList } from '@/components/player';
import type { Track } from '@/lib/supabase/types';

// No hardcoded demo tracks — fetch everything from API

export default function PlayerPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tracks on mount
  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tracks');
        const data = await response.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(data.tracks);
        }
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  // Filter tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      !search ||
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.artist.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = !filter || track.style === filter;

    return matchesSearch && matchesFilter;
  });

  // Get unique styles for filter
  const styles = Array.from(new Set(tracks.map((t) => t.style).filter(Boolean)));

  return (
    <div className="p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Музикална Библиотека</h1>
            <p className="text-gray-400">
              Слушай демо песни и своите генерирани творби
            </p>
          </div>
          <Badge variant="purple" className="self-start">
            {tracks.length} песни
          </Badge>
        </div>

        {/* Search & Filter */}
        <Card variant="glass" padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търси песни..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter(null)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === null
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  Всички
                </button>
                {styles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setFilter(style || null)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      filter === style
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Track List */}
        <Card variant="glass" padding="md">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <TrackList tracks={filteredTracks} />
          )}
        </Card>
      </div>

    </div>
  );
}
