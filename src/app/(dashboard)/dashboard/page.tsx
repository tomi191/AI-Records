'use client';

import { useEffect } from 'react';
import { Sparkles, Music, FileText, TrendingUp } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentGenerations from '@/components/dashboard/RecentGenerations';

export default function DashboardPage() {
  const { user, isAuthenticated } = useUserStore();

  // Demo stats
  const stats = {
    credits: user?.credits || 10,
    totalGenerations: 12,
    lyricsGenerated: 8,
    musicGenerated: 4,
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Добре дошъл{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-400">
          Преглед на твоята музикална активност
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Налични Кредити"
          value={stats.credits}
          icon={Sparkles}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Общо Генерации"
          value={stats.totalGenerations}
          icon={TrendingUp}
          trend={{ value: 25, isPositive: true }}
          gradient="from-cyan-500 to-blue-500"
        />
        <StatsCard
          title="Създадени Текстове"
          value={stats.lyricsGenerated}
          icon={FileText}
          gradient="from-orange-500 to-red-500"
        />
        <StatsCard
          title="Генерирани Песни"
          value={stats.musicGenerated}
          icon={Music}
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <QuickActions />
        <RecentGenerations />
      </div>
    </div>
  );
}
