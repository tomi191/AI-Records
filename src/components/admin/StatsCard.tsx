'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-purple-400',
  description,
}: StatsCardProps) {
  const changeColorClass = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  }[changeType];

  return (
    <Card variant="glass" padding="lg" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColorClass}`}>
              {changeType === 'positive' && '+'}
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 bg-white/[0.05] rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 rounded-full blur-2xl" />
    </Card>
  );
}
