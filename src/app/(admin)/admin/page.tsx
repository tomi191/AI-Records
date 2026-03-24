import Link from 'next/link';
import { supabaseAdmin } from '@/lib/auth';
import { Music, Users, Star, Upload } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch real data from Supabase
  const [tracksResult, profilesResult, featuredResult, recentResult] =
    await Promise.all([
      supabaseAdmin
        .from('tracks')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('tracks')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true),
      supabaseAdmin
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  const trackCount = tracksResult.count ?? 0;
  const profileCount = profilesResult.count ?? 0;
  const featuredCount = featuredResult.count ?? 0;
  const recentTracks = recentResult.data ?? [];

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
        <Link
          href="/admin/upload"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Качи Музика
        </Link>
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

      {/* Recent Tracks Table */}
      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Последни Песни</h3>
          </div>
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
                    Стил
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Play
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Download
                  </th>
                  <th className="pb-4 text-sm font-medium text-gray-400">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {recentTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 text-white font-medium">
                      {track.title}
                    </td>
                    <td className="py-4 text-gray-400">{track.artist}</td>
                    <td className="py-4 text-gray-400">
                      {track.style || '—'}
                    </td>
                    <td className="py-4 text-gray-400">
                      {track.play_count ?? 0}
                    </td>
                    <td className="py-4 text-gray-400">
                      {track.download_count ?? 0}
                    </td>
                    <td className="py-4">
                      {track.is_featured ? (
                        <span className="text-yellow-400" title="Featured">
                          ⭐
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
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
