export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'UNLIMITED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          avatar_url: string | null;
          subscription_tier: SubscriptionTier;
          credits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: SubscriptionTier;
          credits?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'lyrics' | 'music';
          style: string | null;
          mood: string | null;
          topic: string | null;
          lyrics: string | null;
          audio_url: string | null;
          credits_used: number;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: 'lyrics' | 'music';
          style?: string | null;
          mood?: string | null;
          topic?: string | null;
          lyrics?: string | null;
          audio_url?: string | null;
          credits_used?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          type?: 'lyrics' | 'music';
          style?: string | null;
          mood?: string | null;
          topic?: string | null;
          lyrics?: string | null;
          audio_url?: string | null;
          credits_used?: number;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Relationships: [];
      };
      tracks: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          artist: string;
          audio_url: string | null;
          youtube_url: string | null;
          cover_url: string | null;
          lyrics: string | null;
          style: string | null;
          is_public: boolean;
          play_count: number;
          duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          artist?: string;
          audio_url?: string | null;
          youtube_url?: string | null;
          cover_url?: string | null;
          lyrics?: string | null;
          style?: string | null;
          is_public?: boolean;
          play_count?: number;
          duration?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          artist?: string;
          audio_url?: string | null;
          youtube_url?: string | null;
          cover_url?: string | null;
          lyrics?: string | null;
          style?: string | null;
          is_public?: boolean;
          play_count?: number;
          duration?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      subscription_tier: SubscriptionTier;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Generation = Database['public']['Tables']['generations']['Row'];
export type Track = Database['public']['Tables']['tracks']['Row'];
