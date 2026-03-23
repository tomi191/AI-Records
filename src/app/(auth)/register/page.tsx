import Link from 'next/link';
import { Music4 } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register | AI-Records',
  description: 'Create your AI-Records account and start making music',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl">
              <Music4 className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-white">AI-Records</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <RegisterForm />
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} AI-Records. All rights reserved.
      </footer>
    </div>
  );
}
