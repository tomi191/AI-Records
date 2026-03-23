'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = 'from-purple-500 to-cyan-500',
}: StatsCardProps) {
  return (
    <Card variant="glass" padding="md" className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className={cn(
          'absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20',
          `bg-gradient-to-br ${gradient}`
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          {trend && (
            <p
              className={cn(
                'text-sm mt-2',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-gradient-to-br', gradient)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}
