import { Navbar, Footer } from '@/components/layout';

export const metadata = {
  title: 'Политика за Поверителност | AI-Records',
  description: 'Политика за поверителност и защита на личните данни на AI-Records',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            Политика за Поверителност
          </h1>

          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-400 text-lg mb-8">
              Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Въведение</h2>
              <p className="text-gray-400 mb-4">
                AI-Records (&quot;ние&quot;, &quot;нас&quot; или &quot;нашата платформа&quot;) се ангажира да защитава вашата
                поверителност. Тази политика описва как събираме, използваме и защитаваме вашите
                лични данни, когато използвате нашата платформа за създаване на музика.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Събирани Данни</h2>
              <p className="text-gray-400 mb-4">Ние събираме следните видове информация:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Информация за акаунта:</strong> имейл адрес, потребителско име, парола (криптирана)</li>
                <li><strong className="text-white">Данни за използване:</strong> генерирани текстове, създадена музика, история на използване</li>
                <li><strong className="text-white">Технически данни:</strong> IP адрес, тип браузър, устройство, операционна система</li>
                <li><strong className="text-white">Данни за плащания:</strong> обработват се чрез Stripe и не се съхраняват от нас</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Използване на Данните</h2>
              <p className="text-gray-400 mb-4">Вашите данни се използват за:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Предоставяне и подобряване на нашите услуги</li>
                <li>Управление на вашия акаунт и абонамент</li>
                <li>Изпращане на важни съобщения относно услугата</li>
                <li>Анализ на използването за подобряване на платформата</li>
                <li>Защита срещу злоупотреби и измами</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Съхранение на Данните</h2>
              <p className="text-gray-400 mb-4">
                Вашите данни се съхраняват сигурно на сървъри в Европейския съюз чрез Supabase.
                Прилагаме индустриални стандарти за сигурност, включително криптиране на данните
                в покой и при пренос.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Споделяне на Данни</h2>
              <p className="text-gray-400 mb-4">
                Ние не продаваме вашите лични данни. Споделяме данни само с:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Доставчици на услуги:</strong> Supabase (хостинг), Stripe (плащания)</li>
                <li><strong className="text-white">Правни органи:</strong> когато се изисква от закона</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Вашите Права (GDPR)</h2>
              <p className="text-gray-400 mb-4">Съгласно GDPR, вие имате право на:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li><strong className="text-white">Достъп:</strong> да получите копие от вашите данни</li>
                <li><strong className="text-white">Коригиране:</strong> да поправите неточни данни</li>
                <li><strong className="text-white">Изтриване:</strong> да поискате изтриване на данните си</li>
                <li><strong className="text-white">Преносимост:</strong> да получите данните си в машинно четим формат</li>
                <li><strong className="text-white">Възражение:</strong> да възразите срещу обработката на данните си</li>
              </ul>
              <p className="text-gray-400 mt-4">
                За упражняване на тези права, свържете се с нас на: privacy@ai-records.com
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Бисквитки</h2>
              <p className="text-gray-400 mb-4">
                Използваме само необходими бисквитки за функционирането на платформата,
                включително за поддържане на вашата сесия и запомняне на предпочитанията ви.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Промени в Политиката</h2>
              <p className="text-gray-400 mb-4">
                Можем да актуализираме тази политика периодично. При съществени промени ще ви
                уведомим по имейл или чрез известие в платформата.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Контакт</h2>
              <p className="text-gray-400 mb-4">
                За въпроси относно поверителността, свържете се с нас:
              </p>
              <ul className="list-none text-gray-400 space-y-2">
                <li>Имейл: privacy@ai-records.com</li>
                <li>Адрес: София, България</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
