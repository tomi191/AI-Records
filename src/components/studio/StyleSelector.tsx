'use client';

import { MusicStyle } from '@/lib/types';
import { MUSIC_STYLES } from '@/knowledge/music-styles';
import { cn } from '@/lib/utils';
import {
  Mic2,
  Guitar,
  Headphones,
  Radio,
  Music,
  Sparkles,
  Music2,
  Piano,
} from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: MusicStyle;
  onStyleChange: (style: MusicStyle) => void;
}

// Map style IDs to Lucide icons
const styleIcons: Record<MusicStyle, typeof Mic2> = {
  pop: Mic2,
  rock: Guitar,
  'hip-hop': Headphones,
  electronic: Radio,
  rnb: Music,
  chalga: Sparkles,
  folk: Music2,
  ballad: Piano,
};

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const styles = Object.values(MUSIC_STYLES);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Музикален Стил
      </h3>
      <div className="space-y-2">
        {styles.map((style) => {
          const Icon = styleIcons[style.id];
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isSelected
                  ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/5'
                  : 'bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]'
              )}
            >
              <div
                className={cn(
                  'p-2.5 rounded-lg transition-all',
                  isSelected
                    ? 'bg-gradient-to-br from-purple-500 to-cyan-500'
                    : 'bg-white/[0.05] group-hover:bg-white/[0.1]'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  )}
                />
              </div>
              <div className="text-left flex-1">
                <div
                  className={cn(
                    'font-medium transition-colors',
                    isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  )}
                >
                  {style.nameBg}
                </div>
                <div className="text-xs text-gray-500">{style.name}</div>
              </div>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
