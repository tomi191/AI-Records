import { create } from 'zustand';
import type { MusicStyle, Mood } from '@/lib/types';

export type GenerationType = 'lyrics' | 'music';
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

interface StudioState {
  // Lyrics Generation
  style: MusicStyle;
  mood: Mood;
  topic: string;
  lyrics: string;
  stylePrompt: string;

  // Music Generation
  musicPrompt: string;
  taskId: string | null;
  audioUrl: string | null;

  // Status
  status: GenerationStatus;
  generationType: GenerationType | null;
  error: string | null;
  isStreaming: boolean;

  // Actions
  setStyle: (style: MusicStyle) => void;
  setMood: (mood: Mood) => void;
  setTopic: (topic: string) => void;
  setLyrics: (lyrics: string) => void;
  appendLyrics: (chunk: string) => void;
  setStylePrompt: (prompt: string) => void;
  setMusicPrompt: (prompt: string) => void;
  setTaskId: (taskId: string | null) => void;
  setAudioUrl: (url: string | null) => void;
  setStatus: (status: GenerationStatus) => void;
  setGenerationType: (type: GenerationType | null) => void;
  setError: (error: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  reset: () => void;
  resetLyrics: () => void;
  resetMusic: () => void;
}

const initialState = {
  style: 'chalga' as MusicStyle,
  mood: 'romantic' as Mood,
  topic: '',
  lyrics: '',
  stylePrompt: '',
  musicPrompt: '',
  taskId: null,
  audioUrl: null,
  status: 'idle' as GenerationStatus,
  generationType: null,
  error: null,
  isStreaming: false,
};

export const useStudioStore = create<StudioState>((set) => ({
  ...initialState,

  setStyle: (style) => set({ style }),
  setMood: (mood) => set({ mood }),
  setTopic: (topic) => set({ topic }),
  setLyrics: (lyrics) => set({ lyrics }),
  appendLyrics: (chunk) => set((state) => ({ lyrics: state.lyrics + chunk })),
  setStylePrompt: (stylePrompt) => set({ stylePrompt }),
  setMusicPrompt: (musicPrompt) => set({ musicPrompt }),
  setTaskId: (taskId) => set({ taskId }),
  setAudioUrl: (audioUrl) => set({ audioUrl }),
  setStatus: (status) => set({ status }),
  setGenerationType: (generationType) => set({ generationType }),
  setError: (error) => set({ error }),
  setStreaming: (isStreaming) => set({ isStreaming }),

  reset: () => set(initialState),

  resetLyrics: () =>
    set({
      lyrics: '',
      stylePrompt: '',
      status: 'idle',
      error: null,
      isStreaming: false,
    }),

  resetMusic: () =>
    set({
      taskId: null,
      audioUrl: null,
      status: 'idle',
      error: null,
    }),
}));
