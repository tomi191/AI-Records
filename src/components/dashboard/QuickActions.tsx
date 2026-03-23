'use client';

import Link from 'next/link';
import { PenTool, Wand2, Headphones, CreditCard, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';

const actions = [
  {
    title: 'Генерирай Текст',
    description: 'Създай български текст за песни',
    icon: PenTool,
    href: '/studio/lyrics',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Създай Музика',
    description: 'Генерирай пълноценни песни',
    icon: Wand2,
    href: '/studio/generate',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    title: 'Музикална Библиотека',
    description: 'Слушай генерираните песни',
    icon: Headphones,
    href: '/player',
    gradient: 'from-orange-600 to-red-600',
  },
  {
    title: 'Вземи Кредити',
    description: 'Закупи още кредити за генериране',
    icon: CreditCard,
    href: '/pricing',
    gradient: 'from-green-600 to-emerald-600',
  },
];

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Бързи Действия</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link key={action.href} href={action.href}>
              <Card
                variant="glass"
                hover
                padding="md"
                className="h-full group flex items-start gap-4"
              >
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
