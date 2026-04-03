import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Цени и Планове | AI-Records',
  description: 'Безплатен, Стартер ($9/мес) и Про ($29/мес) планове за AI музикална генерация. Започни безплатно.',
  openGraph: {
    title: 'Цени и Планове | AI-Records',
    description: 'Безплатен, Стартер ($9/мес) и Про ($29/мес) планове за AI музикална генерация. Започни безплатно.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/pricing',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
