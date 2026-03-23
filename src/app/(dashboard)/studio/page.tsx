import Link from 'next/link';
import { PenTool, Wand2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui';

const studioOptions = [
  {
    title: 'Генератор на Текстове',
    description: 'Създавай професионални български текстове за песни',
    icon: PenTool,
    href: '/studio/lyrics',
    gradient: 'from-purple-600 to-pink-600',
    features: ['8 Музикални Стила', 'Структурни Тагове', 'Реално Време'],
  },
  {
    title: 'Генератор на Музика',
    description: 'Превърни текстовете си в пълноценни песни',
    icon: Wand2,
    href: '/studio/generate',
    gradient: 'from-cyan-600 to-blue-600',
    features: ['Пълна Интеграция', 'Преглед на Аудио', 'Изтегли MP3'],
  },
];

export default function StudioPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Студио</h1>
        <p className="text-gray-400">Избери какво искаш да създадеш днес</p>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {studioOptions.map((option) => {
          const Icon = option.icon;

          return (
            <Link key={option.href} href={option.href}>
              <Card
                variant="glass"
                hover
                padding="lg"
                className="h-full group relative overflow-hidden"
              >
                {/* Background glow */}
                <div
                  className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${option.gradient} group-hover:opacity-30 transition-opacity`}
                />

                <div className="relative">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${option.gradient} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {option.title}
                  </h2>
                  <p className="text-gray-400 mb-6">{option.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {option.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 text-xs text-gray-300 bg-white/[0.05] rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-purple-400 font-medium">
                    <span>Започни</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
