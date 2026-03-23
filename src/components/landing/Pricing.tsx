'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

const plans = [
  {
    name: 'Безплатен',
    description: 'Перфектен за изпробване на AI-Records',
    price: '0',
    period: 'завинаги',
    credits: 10,
    icon: Sparkles,
    features: [
      '10 кредита месечно',
      'Генериране на текстове (1 кредит)',
      'Основни стилове',
      'Експорт формат',
      'Поддръжка от общността',
    ],
    cta: 'Започни',
    variant: 'secondary' as const,
    popular: false,
  },
  {
    name: 'Стартер',
    description: 'За любители музиканти',
    price: '9',
    period: '/месец',
    credits: 50,
    icon: Zap,
    features: [
      '50 кредита месечно',
      'Генериране на текстове (1 кредит)',
      'Генериране на музика (3 кредита)',
      'Всички музикални стилове',
      'Приоритетно генериране',
      'Имейл поддръжка',
    ],
    cta: 'Пробен Период',
    variant: 'primary' as const,
    popular: true,
  },
  {
    name: 'Про',
    description: 'За професионални творци',
    price: '29',
    period: '/месец',
    credits: 200,
    icon: Crown,
    features: [
      '200 кредита месечно',
      'Всичко от Стартер',
      'Персонализирани стилове',
      'Масово генериране',
      'API достъп',
      'Приоритетна поддръжка',
    ],
    cta: 'Стани Про',
    variant: 'secondary' as const,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] -translate-x-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-headline font-bold text-white mb-4">
            Прости и Прозрачни Цени
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Започни безплатно и надгради, когато имаш нужда. Без скрити такси.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant={plan.popular ? 'gradient' : 'glass'}
                  padding="lg"
                  className={`relative h-full ${
                    plan.popular ? 'border-purple-500/30 scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge
                      variant="purple"
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      Най-популярен
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg ${
                        plan.popular
                          ? 'bg-purple-500/20'
                          : 'bg-white/[0.05]'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          plan.popular ? 'text-purple-400' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      <p className="text-xs text-gray-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/[0.08]">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">
                      {plan.credits} кредита / месец
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/register" className="block">
                    <Button variant={plan.variant} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          Всички планове включват безплатни актуализации. Откажи по всяко време.
        </motion.p>
      </div>
    </section>
  );
}
