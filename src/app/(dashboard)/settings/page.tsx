'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Bell,
  Trash2,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useUserStore, TIER_LIMITS } from '@/store/userStore';
import { Card, Button, Input, Badge } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { getClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = getClient();

      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user?.id || '');

      if (error) throw error;

      setMessage({ type: 'success', text: 'Профилът е обновен успешно!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Неуспешно обновяване на профила',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
    logout();
    router.push('/');
  };

  const tierInfo = user ? TIER_LIMITS[user.subscription_tier] : TIER_LIMITS.FREE;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Настройки</h1>
          <p className="text-gray-400">Управлявай акаунта и предпочитанията си</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Профил</TabsTrigger>
            <TabsTrigger value="subscription">Абонамент</TabsTrigger>
            <TabsTrigger value="notifications">Известия</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Message */}
              {message && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    message.type === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Profile Info */}
              <Card variant="glass" padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Информация за Профила
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Пълно Име"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Имейл"
                    value={email}
                    disabled
                    leftIcon={<Mail className="w-4 h-4" />}
                    hint="Имейлът не може да бъде променен"
                  />
                  <Button
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Запази Промените
                  </Button>
                </div>
              </Card>

              {/* Password */}
              <Card variant="glass" padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-400" />
                  Парола
                </h2>
                <p className="text-gray-400 mb-4">
                  Промени паролата си, за да защитиш акаунта си
                </p>
                <Button variant="secondary">Промени Паролата</Button>
              </Card>

              {/* Danger Zone */}
              <Card variant="glass" padding="lg" className="border-red-500/20">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  Опасна Зона
                </h2>
                <p className="text-gray-400 mb-4">
                  Изтрий завинаги акаунта си и всички свързани данни
                </p>
                <div className="flex gap-3">
                  <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                    Изтрий Акаунта
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    Изход
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-6">
              {/* Current Plan */}
              <Card variant="gradient" padding="lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      Текущ План
                    </h2>
                    <Badge variant="purple" className="text-sm">
                      {user?.subscription_tier || 'FREE'}
                    </Badge>
                  </div>
                  <Button variant="primary" onClick={() => router.push('/pricing')}>
                    Надгради Плана
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-black/20 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Кредити Този Месец</p>
                    <p className="text-2xl font-bold text-white">
                      {user?.credits || 0}{' '}
                      <span className="text-sm text-gray-500">/ {tierInfo.monthlyCredits}</span>
                    </p>
                  </div>
                  <div className="p-4 bg-black/20 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Дата на Подновяване</p>
                    <p className="text-2xl font-bold text-white">
                      {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Billing History */}
              <Card variant="glass" padding="lg">
                <h2 className="text-lg font-semibold text-white mb-6">История на Плащанията</h2>
                <p className="text-gray-500 text-center py-8">Няма налична история на плащанията</p>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card variant="glass" padding="lg">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Имейл Известия
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'generation', label: 'Завършено Генериране', desc: 'Получи известие, когато песента ти е готова' },
                  { id: 'credits', label: 'Ниски Кредити', desc: 'Известие при намаляване на кредитите' },
                  { id: 'news', label: 'Актуализации', desc: 'Нови функции и подобрения' },
                  { id: 'tips', label: 'Съвети и Уроци', desc: 'Научи как да създаваш по-добра музика' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-cyan-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
