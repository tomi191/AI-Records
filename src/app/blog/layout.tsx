import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Блог | AI-Records — Новини и Съвети за AI Музика',
  description: 'Статии за създаване на музика с AI, съвети за текстописци и новини от AI-Records.',
  openGraph: {
    title: 'Блог | AI-Records — Новини и Съвети за AI Музика',
    description: 'Статии за създаване на музика с AI, съвети за текстописци и новини от AI-Records.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/blog',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
