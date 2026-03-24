import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Upload,
  ArrowLeft,
  Music4,
} from 'lucide-react';

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Табло', href: '/admin' },
  { icon: Upload, label: 'Качи Музика', href: '/admin/upload' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const role = (user.publicMetadata as Record<string, unknown>)?.role;
  if (role !== 'admin') {
    redirect('/dashboard');
  }

  const userEmail = user.emailAddresses[0]?.emailAddress || '';

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
              <Music4 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">AI-Records</span>
              <span className="block text-xs text-purple-400">Admin</span>
            </div>
          </Link>
        </div>

        {/* User email */}
        <div className="px-6 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
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
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Към сайта</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
