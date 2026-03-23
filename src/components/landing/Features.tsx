'use client';

import { motion } from 'framer-motion';
import {
  PenTool,
  Wand2,
  Headphones,
  Sparkles,
  Globe,
  Zap,
  Music4,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui';

const features = [
  {
    icon: PenTool,
    title: 'Генератор на Текстове',
    description:
      'Създавай професионални български текстове за всеки стил - поп, чалга, рок, фолк и още.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wand2,
    title: 'Създаване на Музика',
    description:
      'Превърни текстовете си в истински песни. Пълно аудио генериране за минути.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Headphones,
    title: 'Музикална Библиотека',
    description:
      'Слушай демо песни и своите генерирани творби. Вграден плейър с пълен контрол.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Globe,
    title: '100% Български',
    description:
      'Специализирано в българския език с правилна граматика, рими и културен контекст.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: FileText,
    title: 'Структурни Тагове',
    description:
      'Автоматично форматиране с [Куплет], [Припев] и други структурни елементи.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Бързо Генериране',
    description:
      'Генериране в реално време. Виж текста да се появява дума по дума.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/[0.03] border border-white/[0.08] rounded-full">
              <Music4 className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">Мощни Функции</span>
            </div>
            <h2 className="text-headline font-bold text-white mb-4">
              Всичко за Създаване на Музика
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              От генериране на текстове до пълно създаване на песни - AI-Records предоставя
              всички инструменти за твоите музикални идеи.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div key={index} variants={itemVariants}>
                <Card variant="glass" hover padding="lg" className="h-full group">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
