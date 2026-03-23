import { create } from 'zustand';
import type { Track } from '@/lib/supabase/types';

interface PlayerState {
  // Current track
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];

  // Playback state
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  isLooping: boolean;
  isShuffled: boolean;

  // Actions
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  history: [],
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  progress: 0,
  duration: 0,
  isLooping: false,
  isShuffled: false,

  setCurrentTrack: (currentTrack) => {
    const { currentTrack: prevTrack, history } = get();
    set({
      currentTrack,
      progress: 0,
      duration: 0,
      history: prevTrack ? [prevTrack, ...history.slice(0, 19)] : history,
    });
  },

  setQueue: (queue) => set({ queue }),

  addToQueue: (track) =>
    set((state) => ({
      queue: [...state.queue, track],
    })),

  removeFromQueue: (trackId) =>
    set((state) => ({
      queue: state.queue.filter((t) => t.id !== trackId),
    })),

  clearQueue: () => set({ queue: [] }),

  playNext: () => {
    const { queue, isLooping, currentTrack, isShuffled } = get();
    if (queue.length === 0) {
      if (isLooping && currentTrack) {
        set({ progress: 0 });
      } else {
        set({ isPlaying: false });
      }
      return;
    }

    let nextIndex = 0;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    }

    const nextTrack = queue[nextIndex];
    const newQueue = queue.filter((_, i) => i !== nextIndex);

    set((state) => ({
      currentTrack: nextTrack,
      queue: newQueue,
      progress: 0,
      duration: 0,
      history: state.currentTrack
        ? [state.currentTrack, ...state.history.slice(0, 19)]
        : state.history,
    }));
  },

  playPrevious: () => {
    const { history, currentTrack, queue } = get();
    if (history.length === 0) {
      set({ progress: 0 });
      return;
    }

    const [prevTrack, ...restHistory] = history;

    set({
      currentTrack: prevTrack,
      history: restHistory,
      queue: currentTrack ? [currentTrack, ...queue] : queue,
      progress: 0,
      duration: 0,
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () =>
    set((state) => ({
      isMuted: !state.isMuted,
    })),

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),

  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
  toggleShuffle: () => set((state) => ({ isShuffled: !state.isShuffled })),
}));
