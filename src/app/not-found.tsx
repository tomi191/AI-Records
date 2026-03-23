'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Music4, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-8 shadow-lg shadow-purple-500/30">
            <Music4 className="w-10 h-10 text-white" />
          </div>

          {/* 404 Number */}
          <h1 className="text-8xl md:text-9xl font-bold gradient-text mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Страницата не е намерена
          </h2>
          <p className="text-lg text-gray-400 max-w-md mx-auto mb-8">
            Изглежда, че тази страница не съществува или е била преместена.
            Нека те върнем към музиката!
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" leftIcon={<Home className="w-5 h-5" />}>
                Към Началната Страница
              </Button>
            </Link>
            <Link href="/studio">
              <Button variant="secondary" size="lg" leftIcon={<Music4 className="w-5 h-5" />}>
                Към Студиото
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-white/[0.08]">
            <p className="text-sm text-gray-500 mb-4">Може би търсиш:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'Цени', href: '/pricing' },
                { label: 'Плейър', href: '/player' },
                { label: 'За нас', href: '/about' },
                { label: 'Контакти', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
