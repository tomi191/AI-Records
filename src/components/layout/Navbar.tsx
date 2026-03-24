'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import {
  Music4,
  LayoutDashboard,
  Mic2,
  Headphones,
  CreditCard,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/userStore';
import { Button, Badge } from '@/components/ui';

const navLinks = [
  { href: '/dashboard', label: 'Табло', icon: LayoutDashboard },
  { href: '/studio', label: 'Студио', icon: Mic2 },
  { href: '/player', label: 'Плейър', icon: Headphones },
  { href: '/pricing', label: 'Цени', icon: CreditCard },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { user: storeUser } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
                <Music4 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-white">AI-Records</span>
              <span className="ml-2 text-xs text-gray-500">v2.0</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {/* Credits Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">{storeUser?.credits ?? 0}</span>
                  <span className="text-xs text-gray-400">кредита</span>
                </div>

                {/* Clerk UserButton */}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                    },
                  }}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Вход
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Регистрация</Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-gray-950/95 backdrop-blur-xl">
          <nav className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
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

            {isSignedIn && (
              <div className="pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-400">Кредити</span>
                  <Badge variant="purple">{storeUser?.credits ?? 0}</Badge>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
