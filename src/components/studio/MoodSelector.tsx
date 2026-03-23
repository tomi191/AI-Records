'use client';

import { Mood } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import {
  Smile,
  Frown,
  Heart,
  Zap,
  Flame,
  CloudRain,
  Star,
  Camera,
} from 'lucide-react';

interface MoodItem {
  id: Mood;
  name: string;
  nameBg: string;
  icon: LucideIcon;
}

const MOODS: MoodItem[] = [
  { id: 'happy', name: 'Happy', nameBg: 'Весело', icon: Smile },
  { id: 'sad', name: 'Sad', nameBg: 'Тъжно', icon: Frown },
  { id: 'romantic', name: 'Romantic', nameBg: 'Романтично', icon: Heart },
  { id: 'energetic', name: 'Energetic', nameBg: 'Енергично', icon: Zap },
  { id: 'aggressive', name: 'Aggressive', nameBg: 'Агресивно', icon: Flame },
  { id: 'melancholic', name: 'Melancholic', nameBg: 'Меланхолично', icon: CloudRain },
  { id: 'hopeful', name: 'Hopeful', nameBg: 'Надеждно', icon: Star },
  { id: 'nostalgic', name: 'Nostalgic', nameBg: 'Носталгично', icon: Camera },
];

interface MoodSelectorProps {
  selectedMood: Mood;
  onMoodChange: (mood: Mood) => void;
}

export default function MoodSelector({ selectedMood, onMoodChange }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Настроение
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;

          return (
            <button
              key={mood.id}
              onClick={() => onMoodChange(mood.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isSelected
                  ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30'
                  : 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isSelected ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-sm transition-colors',
                  isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                )}
              >
                {mood.nameBg}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
