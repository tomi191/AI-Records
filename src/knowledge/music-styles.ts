import { StyleConfig, MusicStyle } from '@/lib/types';

export const MUSIC_STYLES: Record<MusicStyle, StyleConfig> = {
  pop: {
    id: 'pop',
    name: 'Pop',
    nameBg: 'Поп',
    description: 'Модерен поп с запомнящи се мелодии',
    tempo: '100-130 BPM',
    sunoPrompt: 'Bulgarian Pop, Catchy melody, Modern production, Female vocals, Upbeat, Radio-friendly, Synth pop elements',
    typicalStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    icon: '🎤',
  },
  rock: {
    id: 'rock',
    name: 'Rock',
    nameBg: 'Рок',
    description: 'Енергичен рок с китарни рифове',
    tempo: '110-140 BPM',
    sunoPrompt: 'Bulgarian Rock, Electric guitars, Powerful drums, Male vocals, Energetic, Guitar riffs, Rock anthem',
    typicalStructure: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Solo', 'Chorus', 'Outro'],
    icon: '🎸',
  },
  'hip-hop': {
    id: 'hip-hop',
    name: 'Hip-Hop',
    nameBg: 'Хип-Хоп',
    description: 'Модерен хип-хоп с тежки бийтове',
    tempo: '80-100 BPM',
    sunoPrompt: 'Bulgarian Hip-Hop, Trap beats, 808 bass, Male rap vocals, Modern production, Hard-hitting drums, Urban',
    typicalStructure: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Verse 3', 'Hook', 'Outro'],
    icon: '🎧',
  },
  electronic: {
    id: 'electronic',
    name: 'Electronic',
    nameBg: 'Електронна',
    description: 'EDM и електронна танцова музика',
    tempo: '120-150 BPM',
    sunoPrompt: 'Bulgarian Electronic, EDM, Synth leads, Build-ups, Heavy drops, Dance music, Festival sound, Euphoric',
    typicalStructure: ['Intro', 'Build', 'Drop', 'Break', 'Build', 'Drop', 'Outro'],
    icon: '🎹',
  },
  rnb: {
    id: 'rnb',
    name: 'R&B',
    nameBg: 'Ар енд Би',
    description: 'Соулфул R&B с модерни елементи',
    tempo: '70-100 BPM',
    sunoPrompt: 'Bulgarian R&B, Smooth vocals, Soul, Modern R&B production, Emotional, Groove, Silky voice, Contemporary',
    typicalStructure: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    icon: '🎵',
  },
  chalga: {
    id: 'chalga',
    name: 'Chalga',
    nameBg: 'Чалга',
    description: 'Българска поп-фолк музика',
    tempo: '120-140 BPM',
    sunoPrompt: 'Bulgarian Chalga, Pop-folk, Oriental influences, Female vocals, Upbeat dance rhythm, Balkan beats, Synthesizer, Party music',
    typicalStructure: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Instrumental', 'Chorus', 'Outro'],
    icon: '💃',
  },
  folk: {
    id: 'folk',
    name: 'Folk',
    nameBg: 'Народна',
    description: 'Автентична българска народна музика',
    tempo: '90-140 BPM (varies)',
    sunoPrompt: 'Bulgarian Folk, Traditional instruments, Gaida, Kaval, Authentic vocals, Balkan rhythm, Horo dance, Ethnic',
    typicalStructure: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Outro'],
    icon: '🪗',
  },
  ballad: {
    id: 'ballad',
    name: 'Ballad',
    nameBg: 'Балада',
    description: 'Емоционална балада',
    tempo: '60-80 BPM',
    sunoPrompt: 'Bulgarian Ballad, Emotional, Piano-driven, Orchestral elements, Powerful vocals, Heartfelt, Dramatic build, Cinematic',
    typicalStructure: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
    icon: '🎻',
  },
};

// Get style by ID
export function getStyleById(id: MusicStyle): StyleConfig {
  return MUSIC_STYLES[id];
}

// Get all styles as array
export function getAllStyles(): StyleConfig[] {
  return Object.values(MUSIC_STYLES);
}

// Generate SUNO style prompt with mood modifier
export function generateStylePrompt(style: MusicStyle, mood: string, additionalTags?: string[]): string {
  const styleConfig = MUSIC_STYLES[style];
  let prompt = styleConfig.sunoPrompt;

  // Add mood modifier
  const moodModifiers: Record<string, string> = {
    happy: 'Happy, Joyful, Uplifting',
    sad: 'Sad, Melancholic, Emotional',
    romantic: 'Romantic, Sensual, Intimate',
    energetic: 'Energetic, High-energy, Powerful',
    aggressive: 'Aggressive, Intense, Raw',
    melancholic: 'Melancholic, Wistful, Bittersweet',
    hopeful: 'Hopeful, Inspiring, Uplifting',
    nostalgic: 'Nostalgic, Dreamy, Reflective',
  };

  if (moodModifiers[mood]) {
    prompt += `, ${moodModifiers[mood]}`;
  }

  // Add any additional tags
  if (additionalTags && additionalTags.length > 0) {
    prompt += `, ${additionalTags.join(', ')}`;
  }

  return prompt;
}
