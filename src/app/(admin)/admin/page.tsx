import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/auth';
import { Music, Users, Star, Upload, ListMusic, Disc3, Mic2, Sparkles, RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORY_CONFIG = [
  { key: 'original', label: 'Originals', icon: Disc3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'cover', label: 'Covers', icon: Mic2, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { key: 'remix', label: 'Remixes', icon: RotateCcw, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { key: 'ai_generated', label: 'AI Generated', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-500/10' },
] as const;

export default async function AdminDashboard() {
  // Fetch real data from Supabase
  const supabase = getSupabaseAdmin();
  const [tracksResult, profilesResult, featuredResult, recentResult, ...categoryResults] =
    await Promise.all([
      supabase
        .from('tracks')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('tracks')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true),
      supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
      // Category counts
      ...CATEGORY_CONFIG.map((cat) =>
        supabase
          .from('tracks')
          .select('id', { count: 'exact', head: true })
          .eq('category', cat.key)
      ),
    ]);

  const trackCount = tracksResult.count ?? 0;
  const profileCount = profilesResult.count ?? 0;
  const featuredCount = featuredResult.count ?? 0;
  const recentTracks = recentResult.data ?? [];
  const categoryCounts = CATEGORY_CONFIG.map((cat, i) => ({
    ...cat,
    count: categoryResults[i].count ?? 0,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Административно Табло
          </h1>
          <p className="text-gray-400">
            Преглед на системата и статистики
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/tracks"
            className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-gray-800 text-gray-300 hover:text-white font-medium rounded-xl transition-colors"
          >
            <ListMusic className="w-4 h-4" />
            Управление на песни
          </Link>
          <Link
            href="/admin/upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Качи Музика
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Tracks */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Общо Песни</p>
              <p className="text-3xl font-bold text-white">{trackCount}</p>
            </div>
            <div className="p-3 bg-white/[0.05] rounded-xl text-purple-400">
              <Music className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 rounded-full blur-2xl" />
        </div>

        {/* Users */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Потребители</p>
              <p className="text-3xl font-bold text-white">{profileCount}</p>
            </div>
            <div className="p-3 bg-white/[0.05] rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-2xl" />
        </div>

        {/* Featured */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Featured</p>
              <p className="text-3xl font-bold text-white">{featuredCount}</p>
            </div>
            <div className="p-3 bg-white/[0.05] rounded-xl text-yellow-400">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Category Distribution */}
      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
        <h3 className="font-semibold text-white mb-6">Разпределение по категории</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryCounts.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
              >
                <div className={`p-2.5 rounded-lg ${cat.bg}`}>
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{cat.count}</p>
                  <p className="text-xs text-gray-400">{cat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Tracks Table */}
      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Последни Песни</h3>
          </div>
          <Link
            href="/admin/tracks"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Виж всички
          </Link>
        </div>

        {recentTracks.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Все още няма качени песни</p>
            <Link
              href="/admin/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              Качи първата песен
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/[0.08]">
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Заглавие
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Артист
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Категория
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Стил
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Play
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {recentTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-white/[0.02]">
                    <td className="py-4">
                      <Link
                        href={`/admin/tracks/${track.id}/edit`}
                        className="text-white font-medium hover:text-purple-400 transition-colors"
                      >
                        {track.title}
                      </Link>
                    </td>
                    <td className="py-4 text-gray-400">{track.artist}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          track.category === 'original'
                            ? 'bg-purple-500/20 text-purple-400'
                            : track.category === 'cover'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : track.category === 'remix'
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {track.category}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">
                      {track.style || '--'}
                    </td>
                    <td className="py-4 text-gray-400">
                      {track.play_count ?? 0}
                    </td>
                    <td className="py-4">
                      {track.is_featured ? (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
