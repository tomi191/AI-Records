import { SunoMetatag } from '@/lib/types';

// SUNO AI Meta Tags - Complete Reference
// Based on official SUNO documentation and community guides

export const STRUCTURE_TAGS: SunoMetatag[] = [
  { tag: '[Intro]', description: 'Въведение на песента', category: 'structure', example: '[Intro]\n(Инструментал)' },
  { tag: '[Verse]', description: 'Куплет - основна част', category: 'structure', example: '[Verse 1]' },
  { tag: '[Verse 1]', description: 'Първи куплет', category: 'structure' },
  { tag: '[Verse 2]', description: 'Втори куплет', category: 'structure' },
  { tag: '[Verse 3]', description: 'Трети куплет', category: 'structure' },
  { tag: '[Pre-Chorus]', description: 'Преди припев - изграждане на напрежение', category: 'structure' },
  { tag: '[Chorus]', description: 'Припев - основна мелодия', category: 'structure' },
  { tag: '[Post-Chorus]', description: 'След припев - допълнителен hook', category: 'structure' },
  { tag: '[Bridge]', description: 'Мост - контраст преди финала', category: 'structure' },
  { tag: '[Outro]', description: 'Завършек на песента', category: 'structure', example: '[Outro]\n(Fade out)' },
  { tag: '[Drop]', description: 'Електронен drop - пик на енергията', category: 'structure' },
  { tag: '[Break]', description: 'Пауза в музиката', category: 'structure' },
  { tag: '[Interlude]', description: 'Инструментална интерлюдия', category: 'structure' },
  { tag: '[Hook]', description: 'Запомнящ се елемент', category: 'structure' },
  { tag: '[Instrumental]', description: 'Само инструменти', category: 'structure' },
  { tag: '[Solo]', description: 'Солов инструмент', category: 'structure' },
  { tag: '[Fade Out]', description: 'Постепенно затихване', category: 'structure' },
  { tag: '[End]', description: 'Край на песента', category: 'structure' },
];

export const VOICE_TAGS: SunoMetatag[] = [
  { tag: '[Male Vocals]', description: 'Мъжки вокал', category: 'voice' },
  { tag: '[Female Vocals]', description: 'Женски вокал', category: 'voice' },
  { tag: '[Duet]', description: 'Дует - мъж и жена', category: 'voice' },
  { tag: '[Choir]', description: 'Хорово пеене', category: 'voice' },
  { tag: '[Whispers]', description: 'Шепот', category: 'voice' },
  { tag: '[Spoken Word]', description: 'Говорене без мелодия', category: 'voice' },
  { tag: '[Rap]', description: 'Рап секция', category: 'voice' },
  { tag: '[Harmonized]', description: 'Хармонии', category: 'voice' },
  { tag: '[Ad-libs]', description: 'Импровизирани звуци', category: 'voice' },
  { tag: '[Backing Vocals]', description: 'Бек вокали', category: 'voice' },
];

export const VOICE_TONES = [
  'Airy', 'Breathy', 'Crisp', 'Deep', 'Gritty',
  'Smooth', 'Powerful', 'Soft', 'Raspy', 'Sweet',
  'Soulful', 'Ethereal', 'Warm', 'Clear', 'Rich'
];

export const EFFECT_TAGS: SunoMetatag[] = [
  { tag: '[Auto-tuned]', description: 'Auto-tune ефект', category: 'effect' },
  { tag: '[Distorted]', description: 'Дисторшън ефект', category: 'effect' },
  { tag: '[Reverbed]', description: 'Реверб ефект', category: 'effect' },
  { tag: '[Echo]', description: 'Ехо ефект', category: 'effect' },
  { tag: '[Filtered]', description: 'Филтриран звук', category: 'effect' },
  { tag: '[Lo-fi]', description: 'Lo-fi естетика', category: 'effect' },
];

export const INSTRUCTION_TAGS: SunoMetatag[] = [
  { tag: '(Инструментал)', description: 'Само инструменти без вокал', category: 'instruction' },
  { tag: '(о да)', description: 'Ad-lib звук', category: 'instruction' },
  { tag: '(хей!)', description: 'Ad-lib възклицание', category: 'instruction' },
  { tag: '(ммм)', description: 'Мърморене', category: 'instruction' },
  { tag: '(у-у)', description: 'Вокализация', category: 'instruction' },
  { tag: '(yeaah)', description: 'Ad-lib на английски', category: 'instruction' },
  { tag: '(fade out)', description: 'Постепенно затихване', category: 'instruction' },
  { tag: '(building up)', description: 'Изграждане на интензивност', category: 'instruction' },
  { tag: '(slowly)', description: 'По-бавно темпо', category: 'instruction' },
  { tag: '(faster)', description: 'По-бързо темпо', category: 'instruction' },
];

// All metatags combined
export const ALL_METATAGS = [
  ...STRUCTURE_TAGS,
  ...VOICE_TAGS,
  ...EFFECT_TAGS,
  ...INSTRUCTION_TAGS,
];

// Typical song structures by style
export const SONG_STRUCTURES = {
  standard: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
  pop: ['Intro', 'Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
  rock: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Solo', 'Chorus', 'Outro'],
  hiphop: ['Intro', 'Verse 1', 'Hook', 'Verse 2', 'Hook', 'Verse 3', 'Hook', 'Outro'],
  electronic: ['Intro', 'Build', 'Drop', 'Break', 'Build', 'Drop', 'Outro'],
  ballad: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Bridge', 'Chorus', 'Outro'],
  chalga: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Chorus', 'Instrumental', 'Chorus', 'Outro'],
  folk: ['Intro', 'Verse 1', 'Verse 2', 'Chorus', 'Verse 3', 'Chorus', 'Outro'],
};

// Helper to get structure tags for a style
export function getStructureForStyle(style: string): string[] {
  return SONG_STRUCTURES[style as keyof typeof SONG_STRUCTURES] || SONG_STRUCTURES.standard;
}

// Helper to format lyrics with metatags
export function formatWithMetatags(sections: { tag: string; content: string }[]): string {
  return sections.map(s => `[${s.tag}]\n${s.content}`).join('\n\n');
}
