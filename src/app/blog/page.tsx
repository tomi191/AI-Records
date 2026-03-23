'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import { BookOpen, Bell, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-8 shadow-lg shadow-purple-500/30">
                <BookOpen className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="gradient-text">Блог</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                Истории, съвети и новини от света на българската музика и AI-Records.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" padding="lg" className="text-center">
                <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-6">
                  <Bell className="w-10 h-10 text-purple-400" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  Очаквайте Скоро!
                </h2>

                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Работим върху интересно съдържание за вас - съвети за създаване на музика,
                  истории за успех, технически ръководства и още много.
                </p>

                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Какво ще намерите в блога:
                  </p>
                  <ul className="text-gray-400 space-y-2">
                    <li>• Съвети за писане на текстове за песни</li>
                    <li>• Ръководства за различните музикални стилове</li>
                    <li>• Истории на успели творци</li>
                    <li>• Новини и актуализации на платформата</li>
                    <li>• Тенденции в българската музикална сцена</li>
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-white/[0.08]">
                  <p className="text-gray-400 mb-4">
                    Междувременно, защо не създадеш своята първа песен?
                  </p>
                  <Link href="/studio">
                    <Button rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Към Студиото
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Placeholder */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Бъди Първият, Който Ще Разбере
              </h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Регистрирай се за нашия бюлетин и получавай известия за нови публикации,
                функционалности и специални оферти.
              </p>
              <p className="text-sm text-gray-500">
                Бюлетинът ще бъде достъпен скоро. Следи за актуализации!
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
