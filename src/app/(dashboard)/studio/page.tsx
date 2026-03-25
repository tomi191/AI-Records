import Link from 'next/link';
import {
  Mic2,
  Music,
  ArrowRight,
  PenTool,
  Wand2,
  RefreshCw,
  Disc3,
  Layers,
  MicVocal,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui';

interface StudioTool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  credits: number;
  gradient: string;
}

const creationTools: StudioTool[] = [
  {
    title: 'Създай Текст',
    description: 'Генерирай професионални текстове за песни с AI на български',
    icon: PenTool,
    href: '/studio/lyrics',
    credits: 1,
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Генерирай Музика',
    description: 'Превърни текстовете си в пълноценни песни с SUNO AI',
    icon: Wand2,
    href: '/studio/generate',
    credits: 5,
    gradient: 'from-cyan-600 to-blue-600',
  },
];

const instrumentTools: StudioTool[] = [
  {
    title: 'Удължи Песен',
    description: 'Добави нови куплети, припев или инструментал към съществуваща песен',
    icon: RefreshCw,
    href: '/studio/extend',
    credits: 5,
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    title: 'Cover — Промени Стила',
    description: 'Пресъздай песен в нов музикален стил с различен звук',
    icon: Disc3,
    href: '/studio/cover',
    credits: 5,
    gradient: 'from-orange-600 to-amber-600',
  },
  {
    title: 'Mashup',
    description: 'Комбинирай две песни в един уникален микс',
    icon: Layers,
    href: '/studio/mashup',
    credits: 10,
    gradient: 'from-rose-600 to-red-600',
  },
  {
    title: 'Вокали',
    description: 'Раздели вокалите от инструменталния тракт на песен',
    icon: MicVocal,
    href: '/studio/vocals',
    credits: 5,
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    title: 'Видео',
    description: 'Създай музикално видео от готова песен с AI визуализация',
    icon: Video,
    href: '/studio/video',
    credits: 2,
    gradient: 'from-sky-600 to-indigo-600',
  },
];

function ToolCard({ tool }: { tool: StudioTool }) {
  const Icon = tool.icon;

  return (
    <Link href={tool.href}>
      <Card
        variant="glass"
        hover
        padding="lg"
        className="h-full group relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${tool.gradient} group-hover:opacity-30 transition-opacity`}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="px-2.5 py-1 text-xs font-medium text-gray-300 bg-white/[0.08] rounded-full">
              {tool.credits} {tool.credits === 1 ? 'кредит' : 'кредита'}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
            {tool.title}
          </h3>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            {tool.description}
          </p>

          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
            <span>Започни</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function StudioPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
            <Mic2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Студио</h1>
        </div>
        <p className="text-gray-400">Избери какво искаш да създадеш днес</p>
      </div>

      {/* Създаване Section */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
          Създаване
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {creationTools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </div>

      {/* Инструменти Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">
          Инструменти
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {instrumentTools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}
