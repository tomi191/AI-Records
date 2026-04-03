import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'За нас | AI-Records — Българска AI Музикална Платформа',
  description: 'AI-Records е първата българска платформа за създаване на музика с изкуствен интелект. Covers, ремикси и оригинални песни.',
  openGraph: {
    title: 'За нас | AI-Records',
    description: 'Първата българска AI музикална платформа. Създавай, слушай, споделяй.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/about',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
