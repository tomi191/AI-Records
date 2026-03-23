'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Music4 } from 'lucide-react';
import { Button } from '@/components/ui';

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-xl" />

          <div className="relative bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/20 rounded-3xl p-12 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            {/* Glow Effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px]" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-8 shadow-lg shadow-purple-500/30">
                <Music4 className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Готов ли си да Създадеш Първата си Песен?
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                Присъедини се към хиляди творци, които създават българска музика.
                Започни с 10 безплатни кредита днес.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Създай Безплатен Акаунт
                  </Button>
                </Link>
                <Link href="/studio">
                  <Button variant="secondary" size="xl">
                    Пробвай без Регистрация
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
