import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакти | AI-Records',
  description: 'Свържи се с екипа на AI-Records. Поддръжка, въпроси и предложения.',
  openGraph: {
    title: 'Контакти | AI-Records',
    description: 'Свържи се с екипа на AI-Records. Поддръжка, въпроси и предложения.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/contact',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
