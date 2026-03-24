'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Music, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/6 hidden lg:block"
      >
        <div className="p-4 glass-card">
          <Music className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 right-1/6 hidden lg:block"
      >
        <div className="p-4 glass-card">
          <Mic2 className="w-8 h-8 text-cyan-400" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">v2.0 - Създавай песни с един клик</span>
          </div>

          {/* Heading */}
          <h1 className="text-display font-bold text-white mb-6">
            Създай{' '}
            <span className="gradient-text">Българска Музика</span>
            <br />
            Лесно и Бързо
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Генерирай професионални текстове и ги превърни в истински песни.
            Идеално за поп, чалга, рок, фолк и още.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Започни Безплатно
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="secondary" size="xl" leftIcon={<Play className="w-5 h-5" />}>
                Чуй Демо
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-white/[0.08]"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-gray-500">Създадени песни</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">8</p>
              <p className="text-sm text-gray-500">Музикални стила</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-gray-500">На български</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
    </section>
  );
}
