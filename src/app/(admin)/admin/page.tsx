'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import { StatsCard } from '@/components/admin';
import {
  Users,
  CreditCard,
  Music,
  FileText,
  TrendingUp,
  Activity,
  Coins,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

// Mock data - in production, this would come from API calls
const mockStats = {
  sunoCredits: 2450,
  totalUsers: 1234,
  activeUsers: 456,
  paidSubscriptions: 89,
  generationsToday: 127,
  generationsWeek: 892,
  lyricsGenerated: 15234,
  songsGenerated: 3421,
  revenue: 2567,
};

const mockRecentUsers = [
  { id: '1', email: 'ivan@example.com', plan: 'PRO', credits: 180, joinedAt: '2024-01-15' },
  { id: '2', email: 'maria@example.com', plan: 'STARTER', credits: 45, joinedAt: '2024-01-14' },
  { id: '3', email: 'georgi@example.com', plan: 'FREE', credits: 8, joinedAt: '2024-01-14' },
  { id: '4', email: 'elena@example.com', plan: 'PRO', credits: 195, joinedAt: '2024-01-13' },
  { id: '5', email: 'dimitar@example.com', plan: 'STARTER', credits: 32, joinedAt: '2024-01-13' },
];

const mockSystemStatus = {
  api: 'operational',
  database: 'operational',
  generation: 'operational',
  lastError: null,
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Административно Табло</h1>
          <p className="text-gray-400">Преглед на системата и статистики</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Системата работи
          </Badge>
        </div>
      </div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Кредити (API)"
          value={mockStats.sunoCredits.toLocaleString()}
          icon={Coins}
          iconColor="text-yellow-400"
          description="Налични кредити в системата"
        />
        <StatsCard
          title="Общо Потребители"
          value={mockStats.totalUsers.toLocaleString()}
          change="12% този месец"
          changeType="positive"
          icon={Users}
          iconColor="text-blue-400"
        />
        <StatsCard
          title="Платени Абонаменти"
          value={mockStats.paidSubscriptions}
          change="5 нови тази седмица"
          changeType="positive"
          icon={CreditCard}
          iconColor="text-green-400"
        />
        <StatsCard
          title="Генерации Днес"
          value={mockStats.generationsToday}
          change="23% от вчера"
          changeType="positive"
          icon={Music}
          iconColor="text-purple-400"
        />
      </motion.div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold text-white">Статистика Генерации</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Текстове (общо)</span>
                </div>
                <span className="font-semibold text-white">
                  {mockStats.lyricsGenerated.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Песни (общо)</span>
                </div>
                <span className="font-semibold text-white">
                  {mockStats.songsGenerated.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Тази седмица</span>
                </div>
                <span className="font-semibold text-white">
                  {mockStats.generationsWeek.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-white">Системен Статус</h3>
            </div>

            <div className="space-y-4">
              {[
                { name: 'API', status: mockSystemStatus.api },
                { name: 'База данни', status: mockSystemStatus.database },
                { name: 'Генериране', status: mockSystemStatus.generation },
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <span className="text-gray-400">{service.name}</span>
                  <div className="flex items-center gap-2">
                    {service.status === 'operational' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Работи</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400">Проблем</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mockSystemStatus.lastError && (
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <p className="text-sm text-red-400">
                  Последна грешка: {mockSystemStatus.lastError}
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Subscription Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-white">Абонаменти</h3>
            </div>

            <div className="space-y-4">
              {[
                { tier: 'FREE', count: 1045, color: 'bg-gray-500' },
                { tier: 'STARTER', count: 156, color: 'bg-blue-500' },
                { tier: 'PRO', count: 89, color: 'bg-purple-500' },
                { tier: 'UNLIMITED', count: 12, color: 'bg-gradient-to-r from-purple-500 to-cyan-500' },
              ].map((plan) => (
                <div key={plan.tier} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{plan.tier}</span>
                    <span className="text-white">{plan.count}</span>
                  </div>
                  <div className="h-2 bg-white/[0.1] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${plan.color} rounded-full`}
                      style={{ width: `${(plan.count / mockStats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Последни Регистрации</h3>
            </div>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Виж всички →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/[0.08]">
                  <th className="pb-4 text-sm font-medium text-gray-400">Имейл</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">План</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Кредити</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Регистрация</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {mockRecentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 text-white">{user.email}</td>
                    <td className="py-4">
                      <Badge
                        variant={
                          user.plan === 'PRO'
                            ? 'purple'
                            : user.plan === 'STARTER'
                            ? 'cyan'
                            : 'default'
                        }
                      >
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="py-4 text-gray-400">{user.credits}</td>
                    <td className="py-4 text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {user.joinedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <button className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-left transition-colors group">
          <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
            Добави Кредити
          </h4>
          <p className="text-sm text-gray-500">Презареди API кредитите</p>
        </button>
        <button className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-left transition-colors group">
          <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
            Експорт Данни
          </h4>
          <p className="text-sm text-gray-500">Изтегли статистики като CSV</p>
        </button>
        <button className="p-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-left transition-colors group">
          <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">
            Системни Логове
          </h4>
          <p className="text-sm text-gray-500">Прегледай последните събития</p>
        </button>
      </motion.div>
    </div>
  );
}
