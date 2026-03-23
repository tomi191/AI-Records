'use client';

import Link from 'next/link';
import { Music, FileText, Clock, ArrowRight } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

// Demo data for recent generations
const demoGenerations = [
  {
    id: '1',
    type: 'lyrics',
    title: 'Нощен копнеж',
    style: 'Pop',
    mood: 'Romantic',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    status: 'completed',
  },
  {
    id: '2',
    type: 'music',
    title: 'Без посока',
    style: 'Chalga',
    mood: 'Energetic',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'completed',
  },
  {
    id: '3',
    type: 'lyrics',
    title: 'Изгубени дни',
    style: 'Ballad',
    mood: 'Melancholic',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: 'completed',
  },
];

function getTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `преди ${minutes}м`;
  if (hours < 24) return `преди ${hours}ч`;
  return `преди ${days}д`;
}

export default function RecentGenerations() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Последни Генерации</h2>
        <Link
          href="/dashboard/history"
          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          Виж Всички
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <Card variant="glass" padding="none" className="divide-y divide-white/[0.05]">
        {demoGenerations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-2">Все още няма генерации</p>
            <p className="text-sm text-gray-600">
              Започни да създаваш текстове или музика
            </p>
          </div>
        ) : (
          demoGenerations.map((gen) => (
            <div
              key={gen.id}
              className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors"
            >
              <div
                className={`p-2.5 rounded-lg ${
                  gen.type === 'music'
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-purple-500/10 text-purple-400'
                }`}
              >
                {gen.type === 'music' ? (
                  <Music className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{gen.title}</p>
                <p className="text-sm text-gray-500">
                  {gen.style} &bull; {gen.mood}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={gen.type === 'music' ? 'cyan' : 'purple'} size="sm">
                  {gen.type === 'music' ? 'Музика' : 'Текст'}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeAgo(gen.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
