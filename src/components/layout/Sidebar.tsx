'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Sparkles,
  Library,
  Search,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';

const mainLinks = [
  { href: '/home', label: 'Начало', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/create', label: 'Създай', icon: Sparkles },
  { href: '/library', label: 'Библиотека', icon: Library },
  { href: '/library?search=true', label: 'Търсене', icon: Search },
];

const bottomLinks = [{ href: '/settings', label: 'Настройки', icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-64px)] sticky top-16 border-r border-white/[0.08] bg-gray-950/50">
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Credits Card */}
        {user && (
          <div className="p-4 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 border border-purple-500/20 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Налични Кредити</p>
                <p className="text-2xl font-bold text-white">{user.credits}</p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-medium rounded-lg transition-all"
            >
              Вземи Още Кредити
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Основни
          </p>
          {mainLinks.map((link) => {
            const isActive =
              link.href === '/library?search=true'
                ? false
                : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-white border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Links */}
      <div className="px-4 py-4 border-t border-white/[0.08]">
        {bottomLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
