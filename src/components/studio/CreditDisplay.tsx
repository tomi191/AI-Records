'use client';

import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import { Badge, Button } from '@/components/ui';

interface CreditDisplayProps {
  type: 'lyrics' | 'music';
}

export default function CreditDisplay({ type }: CreditDisplayProps) {
  const { user } = useUserStore();
  const credits = user?.credits || 0;
  const cost = CREDIT_COSTS[type];
  const hasEnough = credits >= cost;

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border ${
        hasEnough
          ? 'bg-purple-500/5 border-purple-500/20'
          : 'bg-red-500/5 border-red-500/20'
      }`}
    >
      <div className="flex items-center gap-3">
        {hasEnough ? (
          <Sparkles className="w-5 h-5 text-purple-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400" />
        )}
        <div>
          <p className="text-sm text-gray-300">
            Това генериране струва{' '}
            <span className="font-semibold text-white">{cost} {cost > 1 ? 'кредита' : 'кредит'}</span>
          </p>
          <p className="text-xs text-gray-500">
            Имаш{' '}
            <span className={hasEnough ? 'text-purple-400' : 'text-red-400'}>
              {credits} кредита
            </span>{' '}
            налични
          </p>
        </div>
      </div>

      {!hasEnough && (
        <Link href="/pricing">
          <Button size="sm" variant="outline">
            Вземи Още Кредити
          </Button>
        </Link>
      )}
    </div>
  );
}
