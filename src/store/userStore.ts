import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, SubscriptionTier } from '@/lib/supabase/types';

interface UserState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  updateCredits: (credits: number) => void;
  deductCredits: (amount: number) => boolean;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateCredits: (credits) =>
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        })),

      deductCredits: (amount) => {
        const { user } = get();
        if (!user || user.credits < amount) return false;

        set({
          user: { ...user, credits: user.credits - amount },
        });
        return true;
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
          isLoading: false,
        });
      },
    }),
    {
      name: 'ai-records-user',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Credit costs
export const CREDIT_COSTS = {
  lyrics: 1,
  music: 3,
  cover: 5,
  mashup: 10,
  vocals_separate: 4,
  vocals_add: 5,
  video: 2,
} as const;

// Subscription tier limits
export const TIER_LIMITS: Record<SubscriptionTier, { credits: number; monthlyCredits: number }> = {
  FREE: { credits: 10, monthlyCredits: 10 },
  STARTER: { credits: 50, monthlyCredits: 50 },
  PRO: { credits: 200, monthlyCredits: 200 },
  UNLIMITED: { credits: 9999, monthlyCredits: 9999 },
};
