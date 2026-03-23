'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { getClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/userStore';

const loginSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { setUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profile) {
          setUser(profile);
        }

        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);

    // Simulate a demo user
    const demoUser = {
      id: 'demo-user',
      email: 'demo@ai-records.com',
      name: 'Demo User',
      avatar_url: null,
      subscription_tier: 'FREE' as const,
      credits: 10,
      created_at: new Date().toISOString(),
    };

    setUser(demoUser);
    router.push('/dashboard');
  };

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Добре Дошъл</h1>
        <p className="text-gray-400">Влез в своя акаунт в AI-Records</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Имейл"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Парола"
          type="password"
          placeholder="Въведи паролата си"
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-400">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
            />
            Запомни ме
          </label>
          <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300">
            Забравена парола?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Вход
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-900/80 text-gray-500">Или</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleDemoLogin}
        disabled={isLoading}
      >
        Продължи с Демо Акаунт
      </Button>

      <p className="text-center text-sm text-gray-400 mt-6">
        Нямаш акаунт?{' '}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
          Регистрирай се
        </Link>
      </p>
    </Card>
  );
}
