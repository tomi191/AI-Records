import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Поверителност | AI-Records',
  description: 'Политика за поверителност на AI-Records. Как обработваме и защитаваме вашите данни.',
  openGraph: {
    title: 'Поверителност | AI-Records',
    description: 'Политика за поверителност на AI-Records.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/privacy',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
