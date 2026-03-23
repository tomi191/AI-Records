import { Navbar, Footer } from '@/components/layout';
import { Pricing as PricingSection } from '@/components/landing';

export const metadata = {
  title: 'Цени | AI-Records',
  description: 'Избери перфектния план за твоите музикални нужди',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">
              Избери Своя План
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Започни да създаваш музика безплатно, надгради когато имаш нужда от повече кредити.
              Всички планове включват пълен достъп до всички функционалности.
            </p>
          </div>
        </div>
        <PricingSection />

        {/* FAQ Section */}
        <section className="py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white text-center mb-12">
              Често Задавани Въпроси
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Как работят кредитите?',
                  a: 'Кредитите се използват за генериране на съдържание. Генерирането на текст струва 1 кредит, а създаването на музика струва 3 кредита. Кредитите се подновяват всеки месец според плана ти.',
                },
                {
                  q: 'Мога ли да откажа по всяко време?',
                  a: 'Да! Можеш да откажеш абонамента си по всяко време. Ще запазиш достъпа до плана си до края на платежния период.',
                },
                {
                  q: 'Неизползваните кредити преминават ли към следващия месец?',
                  a: 'Кредитите не преминават към следващия месец. Използвай ги преди датата на подновяване!',
                },
                {
                  q: 'Какви методи на плащане приемате?',
                  a: 'Приемаме всички основни кредитни карти и PayPal. Плащанията се обработват сигурно чрез Stripe.',
                },
                {
                  q: 'Има ли политика за възстановяване?',
                  a: 'Ако не си доволен в първите 7 дни, предлагаме пълно възстановяване на сумата. Свържи се с поддръжката за помощ.',
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-xl"
                >
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
