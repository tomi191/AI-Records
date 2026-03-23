import { Navbar, Footer } from '@/components/layout';

export const metadata = {
  title: 'Условия за Ползване | AI-Records',
  description: 'Условия за ползване на платформата AI-Records',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-8">
            Условия за Ползване
          </h1>

          <div className="prose prose-invert prose-gray max-w-none">
            <p className="text-gray-400 text-lg mb-8">
              Последна актуализация: {new Date().toLocaleDateString('bg-BG')}
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Приемане на Условията</h2>
              <p className="text-gray-400 mb-4">
                С достъпа и използването на AI-Records (&quot;Платформата&quot;), вие се съгласявате да
                бъдете обвързани с тези Условия за ползване. Ако не сте съгласни с някое от
                условията, моля не използвайте Платформата.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Описание на Услугата</h2>
              <p className="text-gray-400 mb-4">
                AI-Records е платформа за създаване на музикално съдържание, включително:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Генериране на текстове за песни на български език</li>
                <li>Създаване на музикални композиции</li>
                <li>Слушане и изтегляне на генерирано съдържание</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Регистрация и Акаунт</h2>
              <p className="text-gray-400 mb-4">За да използвате пълните функции на Платформата:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Трябва да създадете акаунт с валиден имейл адрес</li>
                <li>Отговаряте за сигурността на вашия акаунт и парола</li>
                <li>Трябва да сте навършили 16 години</li>
                <li>Не можете да споделяте акаунта си с други лица</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Кредитна Система</h2>
              <p className="text-gray-400 mb-4">Платформата използва кредитна система:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Генерирането на текстове изразходва 1 кредит</li>
                <li>Създаването на музика изразходва 3 кредита</li>
                <li>Кредитите се подновяват месечно според вашия план</li>
                <li>Неизползваните кредити не се прехвърлят към следващия месец</li>
                <li>Кредитите не подлежат на възстановяване</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Права върху Съдържанието</h2>
              <p className="text-gray-400 mb-4">
                <strong className="text-white">Вашето съдържание:</strong> Вие запазвате всички права върху
                текстовете и идеите, които въвеждате в Платформата.
              </p>
              <p className="text-gray-400 mb-4">
                <strong className="text-white">Генерирано съдържание:</strong> Съдържанието, генерирано от
                Платформата, ви се предоставя с лиценз за лична и комерсиална употреба, при
                условие че имате активен платен абонамент.
              </p>
              <p className="text-gray-400 mb-4">
                <strong className="text-white">Ограничения:</strong> Безплатните потребители могат да
                използват генерираното съдържание само за лични, некомерсиални цели.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Забранени Дейности</h2>
              <p className="text-gray-400 mb-4">Забранено е да използвате Платформата за:</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Създаване на незаконно, обидно или вредно съдържание</li>
                <li>Нарушаване на авторски права или други права на интелектуална собственост</li>
                <li>Опити за заобикаляне на системите за сигурност</li>
                <li>Автоматизиран достъп без наше изрично разрешение</li>
                <li>Препродаване на достъп до Платформата</li>
                <li>Създаване на съдържание, което насърчава омраза или насилие</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Плащания и Възстановявания</h2>
              <p className="text-gray-400 mb-4">
                <strong className="text-white">Абонаменти:</strong> Платените планове се таксуват месечно
                чрез Stripe. Можете да откажете по всяко време.
              </p>
              <p className="text-gray-400 mb-4">
                <strong className="text-white">Възстановяване:</strong> Предлагаме пълно възстановяване
                в рамките на 7 дни от първоначалния абонамент. След този период, плащанията
                не подлежат на възстановяване.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Ограничение на Отговорността</h2>
              <p className="text-gray-400 mb-4">
                Платформата се предоставя &quot;както е&quot;. Не гарантираме непрекъсната работа или
                годност за конкретна цел. Не носим отговорност за:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>Загуби от прекъсване на услугата</li>
                <li>Загуба на данни</li>
                <li>Косвени или последващи щети</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Прекратяване</h2>
              <p className="text-gray-400 mb-4">
                Можем да прекратим или спрем вашия достъп незабавно, без предизвестие, ако
                нарушите тези Условия. При прекратяване губите достъп до вашия акаунт и
                генерираното съдържание.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Промени в Условията</h2>
              <p className="text-gray-400 mb-4">
                Запазваме правото да променяме тези Условия по всяко време. При съществени
                промени ще ви уведомим по имейл минимум 14 дни преди влизането им в сила.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Приложимо Право</h2>
              <p className="text-gray-400 mb-4">
                Тези Условия се уреждат от законите на Република България. Всички спорове
                ще бъдат решавани от компетентните български съдилища.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Контакт</h2>
              <p className="text-gray-400 mb-4">
                За въпроси относно тези Условия:
              </p>
              <ul className="list-none text-gray-400 space-y-2">
                <li>Имейл: legal@ai-records.com</li>
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
