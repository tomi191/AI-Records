'use client';

import Link from 'next/link';
import { Music4 } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Функции', href: '/#features' },
    { label: 'Цени', href: '/pricing' },
    { label: 'Студио', href: '/studio' },
    { label: 'Плейър', href: '/player' },
  ],
  company: [
    { label: 'За нас', href: '/about' },
    { label: 'Блог', href: '/blog' },
    { label: 'Контакти', href: '/contact' },
  ],
  legal: [
    { label: 'Поверителност', href: '/privacy' },
    { label: 'Условия', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
                <Music4 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI-Records</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Създавай професионални български текстове и музика.
              Платформа за музикално творчество от ново поколение.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Продукт</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Компания</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Правна информация</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AI-Records. Всички права запазени.
          </p>
          <p className="text-sm text-gray-500">
            Професионално създаване на музика
          </p>
        </div>
      </div>
    </footer>
  );
}
