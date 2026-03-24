'use client';

import { useEffect, useState } from 'react';
import { Music2, Filter, Search } from 'lucide-react';
import { Card, Input, Badge } from '@/components/ui';
import { TrackList } from '@/components/player';
import type { Track } from '@/lib/supabase/types';

// Demo tracks for initial display
const demoTracks: Track[] = [
  {
    id: 'demo-1',
    user_id: null,
    uploaded_by: null,
    title: 'Без посока',
    artist: 'Sarys',
    style: 'Pop',
    audio_url: '/audio/sarys-bez-posoka.wav',
    youtube_url: null,
    cover_url: null,
    lyrics: null,
    is_public: true,
    is_featured: false,
    play_count: 1234,
    download_count: 0,
    duration: 204,
    file_size: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: null,
    uploaded_by: null,
    title: 'Изгубени дни',
    artist: 'Sarys',
    style: 'Ballad',
    audio_url: '/audio/sarys-izgubeni-dni.wav',
    youtube_url: null,
    cover_url: null,
    lyrics: null,
    is_public: true,
    is_featured: false,
    play_count: 876,
    download_count: 0,
    duration: 252,
    file_size: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    user_id: null,
    uploaded_by: null,
    title: 'Без посока 2',
    artist: 'Sarys',
    style: 'Pop',
    audio_url: '/audio/sarys-bez-posoka-2.wav',
    youtube_url: null,
    cover_url: null,
    lyrics: null,
    is_public: true,
    is_featured: false,
    play_count: 543,
    download_count: 0,
    duration: 198,
    file_size: null,
    created_at: new Date().toISOString(),
  },
];

export default function PlayerPage() {
  const [tracks, setTracks] = useState<Track[]>(demoTracks);
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
