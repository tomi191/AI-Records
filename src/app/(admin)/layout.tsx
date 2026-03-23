'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Music4,
  ChevronLeft,
} from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Табло', href: '/admin' },
  { icon: Users, label: 'Потребители', href: '/admin/users' },
  { icon: CreditCard, label: 'Абонаменти', href: '/admin/subscriptions' },
  { icon: BarChart3, label: 'Статистики', href: '/admin/stats' },
  { icon: Settings, label: 'Настройки', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, logout } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check for admin role (you would need to add is_admin field to Profile type)
    // For now, we'll use a simple check - in production, check user.is_admin
    // if (!user?.is_admin) {
    //   router.push('/dashboard');
    //   return;
    // }
  }, [isAuthenticated, _hasHydrated, mounted, router, user]);

  // Show loading state while hydrating
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 border-r border-white/[0.08] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.08]">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
              <Music4 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">AI-Records</span>
              <span className="block text-xs text-purple-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Към Приложението</span>
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Изход</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
