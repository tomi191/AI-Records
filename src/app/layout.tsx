import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import MusicPlayer from '@/components/player/MusicPlayer';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
};

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
    <ClerkProvider afterSignOutUrl="/">
      <html lang="bg" className="dark">
        <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-200 pb-28`}>
          {children}
          <MusicPlayer />
        </body>
      </html>
    </ClerkProvider>
  );
}
