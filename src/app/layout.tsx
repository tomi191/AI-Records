import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI-Records | Създай Българска Музика',
  description:
    'Генерирай професионални български текстове и ги превърни в истински песни. Идеално за поп, чалга, рок, фолк и други стилове.',
  keywords: [
    'българска музика',
    'текстове на песни',
    'генератор на текстове',
    'създаване на музика',
    'поп',
    'чалга',
    'рок',
    'фолк',
  ],
  authors: [{ name: 'AI-Records' }],
  openGraph: {
    title: 'AI-Records | Създай Българска Музика',
    description:
      'Генерирай професионални български текстове и ги превърни в истински песни.',
    type: 'website',
    siteName: 'AI-Records',
    locale: 'bg_BG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Records | Създай Българска Музика',
    description:
      'Генерирай професионални български текстове и ги превърни в истински песни.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-200`}>
        {children}
      </body>
    </html>
  );
}
