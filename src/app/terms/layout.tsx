import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Условия за ползване | AI-Records',
  description: 'Общи условия за ползване на платформата AI-Records.',
  openGraph: {
    title: 'Условия за ползване | AI-Records',
    description: 'Общи условия за ползване на платформата AI-Records.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
    url: 'https://www.ai-records.eu/terms',
  },
  alternates: {
    canonical: 'https://www.ai-records.eu/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
