'use client';

import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import { Music4, Target, Users, Sparkles, Heart, Zap } from 'lucide-react';
import { Card } from '@/components/ui';

const values = [
  {
    icon: Heart,
    title: 'Страст към Музиката',
    description: 'Вярваме, че всеки заслужава възможността да създава музика, независимо от музикалния си опит.',
  },
  {
    icon: Target,
    title: 'Качество на Първо Място',
    description: 'Стремим се към най-високо качество във всеки генериран текст и всяка създадена песен.',
  },
  {
    icon: Users,
    title: 'Общност',
    description: 'Изграждаме общност от творци, които споделят любовта си към българската музика.',
  },
  {
    icon: Zap,
    title: 'Иновации',
    description: 'Използваме най-новите технологии, за да направим създаването на музика достъпно за всеки.',
  },
];

const stats = [
  { value: '10,000+', label: 'Създадени песни' },
  { value: '5,000+', label: 'Активни потребители' },
  { value: '8', label: 'Музикални стила' },
  { value: '99.9%', label: 'Време на работа' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl mb-8 shadow-lg shadow-purple-500/30">
                <Music4 className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                За <span className="gradient-text">AI-Records</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Мисията ни е да демократизираме създаването на българска музика, като дадем
                на всеки творец инструментите да превърне идеите си в реалност.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6 text-gray-400"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Нашата История</h2>

              <p className="text-lg">
                AI-Records започна като страничен проект на група музикални ентусиасти и разработчици
                от България, които споделяха обща визия - да направят създаването на музика достъпно
                за всеки, независимо от техническите му умения или музикалното му образование.
              </p>

              <p className="text-lg">
                Забелязахме, че докато съществуват много инструменти за създаване на музика на
                английски език, българската музикална сцена остава пренебрегната. Решихме да
                променим това, като създадем платформа, специално оптимизирана за българския език,
                култура и музикални традиции.
              </p>

              <p className="text-lg">
                Днес AI-Records помага на хиляди творци да създават професионални текстове
                за песни и да ги превръщат в пълноценни музикални произведения. От поп до чалга,
                от рок до фолк - платформата ни обхваща всички популярни български музикални стилове.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Нашите Ценности</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Ценностите, които ръководят всичко, което правим
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="glass" padding="lg" className="h-full text-center">
                      <div className="inline-flex p-3 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-xl mb-4">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                      <p className="text-gray-400 text-sm">{value.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team Section Placeholder */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Направено с любов в България
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                AI-Records е създаден от малък, но отдаден екип от разработчици, дизайнери
                и музикални експерти, базирани в София. Всеки ден работим, за да направим
                платформата по-добра за вас.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
