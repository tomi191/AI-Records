'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { getClient } from '@/lib/supabase/client';
import { useUserStore } from '@/store/userStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Името трябва да е поне 2 символа'),
    email: z.string().email('Невалиден имейл адрес'),
    password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролите не съвпадат',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getClient();

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          subscription_tier: 'FREE',
          credits: 10,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setIsSuccess(true);

        // If email confirmation is disabled, redirect to dashboard
        if (authData.session) {
          const profile = {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            avatar_url: null,
            subscription_tier: 'FREE' as const,
            credits: 10,
            created_at: new Date().toISOString(),
          };

          setUser(profile);
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo registration for testing
  const handleDemoRegister = async () => {
    setIsLoading(true);
    setError(null);

    const demoUser = {
      id: 'demo-user-' + Date.now(),
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

  if (isSuccess) {
    return (
      <Card variant="glass" padding="lg" className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Провери Имейла Си</h1>
        <p className="text-gray-400 mb-6">
          Изпратихме ти линк за потвърждение. Моля, натисни го за да потвърдиш
          акаунта си.
        </p>
        <Link href="/login">
          <Button variant="secondary" className="w-full">
            Обратно към Вход
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="lg" className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Създай Акаунт</h1>
        <p className="text-gray-400">Започни да създаваш музика</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Пълно Име"
          type="text"
          placeholder="Иван Иванов"
          leftIcon={<User className="w-5 h-5" />}
          error={errors.name?.message}
          {...register('name')}
        />

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
          placeholder="Създай парола"
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Потвърди Паролата"
          type="password"
          placeholder="Потвърди паролата си"
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <p className="text-xs text-gray-500">
          Създавайки акаунт, се съгласяваш с нашите{' '}
          <Link href="/terms" className="text-purple-400 hover:underline">
            Условия за Ползване
          </Link>{' '}
          и{' '}
          <Link href="/privacy" className="text-purple-400 hover:underline">
            Политика за Поверителност
          </Link>
          .
        </p>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Създай Акаунт
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
        onClick={handleDemoRegister}
        disabled={isLoading}
      >
        Пробвай Демо Акаунт
      </Button>

      <p className="text-center text-sm text-gray-400 mt-6">
        Вече имаш акаунт?{' '}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
          Влез
        </Link>
      </p>
    </Card>
  );
}
