'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { Mail, MessageSquare, MapPin, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'Имейл',
    value: 'support@ai-records.com',
    description: 'Отговаряме в рамките на 24 часа',
  },
  {
    icon: MessageSquare,
    title: 'Поддръжка',
    value: 'help@ai-records.com',
    description: 'Техническа помощ',
  },
  {
    icon: MapPin,
    title: 'Локация',
    value: 'София, България',
    description: 'Работим от разстояние',
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Header */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Свържи се с <span className="gradient-text">Нас</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Имаш въпроси, предложения или просто искаш да кажеш здравей?
                Ще се радваме да чуем от теб!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="glass" padding="lg" className="text-center h-full">
                      <div className="inline-flex p-3 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-xl mb-4">
                        <Icon className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                      <p className="text-purple-400 mb-1">{info.value}</p>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" padding="lg">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-6">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Съобщението е изпратено!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Благодарим ти, че се свърза с нас. Ще отговорим възможно най-скоро.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="secondary">
                      Изпрати ново съобщение
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                      Изпрати ни Съобщение
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Име
                          </label>
                          <Input
                            type="text"
                            value={formState.name}
                            onChange={(e) =>
                              setFormState({ ...formState, name: e.target.value })
                            }
                            placeholder="Твоето име"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Имейл
                          </label>
                          <Input
                            type="email"
                            value={formState.email}
                            onChange={(e) =>
                              setFormState({ ...formState, email: e.target.value })
                            }
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Тема
                        </label>
                        <Input
                          type="text"
                          value={formState.subject}
                          onChange={(e) =>
                            setFormState({ ...formState, subject: e.target.value })
                          }
                          placeholder="Относно какво е запитването?"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Съобщение
                        </label>
                        <Textarea
                          value={formState.message}
                          onChange={(e) =>
                            setFormState({ ...formState, message: e.target.value })
                          }
                          placeholder="Напиши съобщението си тук..."
                          className="min-h-[150px]"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isSubmitting}
                        leftIcon={<Send className="w-5 h-5" />}
                      >
                        Изпрати Съобщение
                      </Button>
                    </form>
                  </>
                )}
              </Card>
            </motion.div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-16 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Често Задавани Въпроси
              </h2>
              <p className="text-gray-400 mb-6">
                Имаш въпроси относно цените или функционалностите?
                Провери нашата страница с цени за повече информация.
              </p>
              <a
                href="/pricing"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Виж Цените и FAQ →
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
