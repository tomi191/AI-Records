import { GenerationRequest, MusicStyle, Mood } from './types';
import { MUSIC_STYLES, generateStylePrompt } from '@/knowledge/music-styles';
import { STRUCTURE_TAGS, VOICE_TAGS, getStructureForStyle, SONG_STRUCTURES } from '@/knowledge/suno-metatags';
import { RHYME_PATTERNS, EMOTION_WORDS, GENRE_VOCABULARY, WRITING_TIPS } from '@/knowledge/bulgarian-rhymes';
import { TRAINING_EXAMPLES, formatExampleForPrompt, getExamplesByStyle } from '@/training/examples';

// Build the system prompt for lyrics generation
export function buildSystemPrompt(style: MusicStyle, mood: Mood): string {
  const styleConfig = MUSIC_STYLES[style];
  const structure = getStructureForStyle(style);
  const relevantExamples = getExamplesByStyle(style);

  // Get genre-specific vocabulary if available
  const genreKey = style === 'hip-hop' ? 'hiphop' : style;
  const vocabulary = GENRE_VOCABULARY[genreKey as keyof typeof GENRE_VOCABULARY] || [];

  return `Ти си професионален автор на текстове за песни на български език. Специализираш се в създаването на текстове, оптимизирани за SUNO AI.

## ТВОЯТА ЗАДАЧА
Създай оригинален, емоционален и запомнящ се текст на песен на БЪЛГАРСКИ ЕЗИК.

## МУЗИКАЛЕН СТИЛ
- Стил: ${styleConfig.nameBg} (${styleConfig.name})
- Описание: ${styleConfig.description}
- Темпо: ${styleConfig.tempo}
- Типична структура: ${structure.join(' → ')}

## НАСТРОЕНИЕ
- Настроение: ${getMoodName(mood)}
- Емоционални ключови думи: ${getEmotionKeywords(mood).join(', ')}

## SUNO ФОРМАТИРАНЕ (ЗАДЪЛЖИТЕЛНО!)
Използвай следните мета тагове за структуриране:
${STRUCTURE_TAGS.slice(0, 10).map(t => `- ${t.tag}: ${t.description}`).join('\n')}

Гласови указания (използвай при нужда):
${VOICE_TAGS.slice(0, 5).map(t => `- ${t.tag}: ${t.description}`).join('\n')}

Ad-libs в скоби: (о да), (хей!), (ммм), (yeaah)
Инструментални указания: (Инструментал), (Piano), (Guitar solo)

## ПРАВИЛА ЗА РИМУВАНЕ
- Използвай различни схеми на римуване: ABAB, AABB, ABBA
- Редувай дълги и къси редове за динамика
- Повтаряй ключови фрази в припева

${vocabulary.length > 0 ? `## ПРЕПОРЪЧИТЕЛЕН РЕЧНИК
${vocabulary.join(', ')}` : ''}

## СЪВЕТИ
${WRITING_TIPS.slice(0, 4).join('\n- ')}

## ПРИМЕРИ ЗА ФОРМАТ
${relevantExamples.length > 0 ? formatExampleForPrompt(relevantExamples[0]) : formatExampleForPrompt(TRAINING_EXAMPLES[0])}

## ВАЖНО
1. Пиши САМО на български език
2. Използвай SUNO мета тагове за всяка секция
3. Направи припева запомнящ се и повторяем
4. Включи минимум 2 куплета и 2 припева
5. Добави intro и outro
6. Текстът трябва да е емоционален и автентичен
7. НЕ обяснявай какво правиш - просто напиши текста`;
}

// Build the user prompt
export function buildUserPrompt(request: GenerationRequest): string {
  const { topic, style, mood } = request;
  const styleConfig = MUSIC_STYLES[style];

  return `Напиши текст на ${styleConfig.nameBg.toLowerCase()} песен на тема: "${topic}"

Настроение: ${getMoodName(mood)}

Изисквания:
- Използвай SUNO мета тагове
- Минимум структура: Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Chorus, Outro
- Добави ad-libs в скоби където е уместно
- Направи припева запомнящ се

Започни директно с текста:`;
}

// Get mood name in Bulgarian
function getMoodName(mood: Mood): string {
  const moodNames: Record<Mood, string> = {
    happy: 'Весело',
    sad: 'Тъжно',
    romantic: 'Романтично',
    energetic: 'Енергично',
    aggressive: 'Агресивно',
    melancholic: 'Меланхолично',
    hopeful: 'Надеждно',
    nostalgic: 'Носталгично',
  };
  return moodNames[mood] || mood;
}

// Get emotion keywords for mood
function getEmotionKeywords(mood: Mood): string[] {
  const keywordMap: Record<Mood, keyof typeof EMOTION_WORDS> = {
    happy: 'happiness',
    sad: 'sadness',
    romantic: 'love',
    energetic: 'happiness',
    aggressive: 'sadness',
    melancholic: 'sadness',
    hopeful: 'happiness',
    nostalgic: 'nostalgia',
  };

  const key = keywordMap[mood];
  return EMOTION_WORDS[key] || EMOTION_WORDS.love;
}

// Generate SUNO style prompt
export function generateSunoStylePrompt(style: MusicStyle, mood: Mood): string {
  return generateStylePrompt(style, mood);
}

// Extract structure from generated lyrics
export function extractStructure(lyrics: string): string[] {
  const structure: string[] = [];
  const tagRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = tagRegex.exec(lyrics)) !== null) {
    const tag = match[1];
    if (!structure.includes(tag)) {
      structure.push(tag);
    }
  }

  return structure;
}

// Validate generated lyrics
export function validateLyrics(lyrics: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for structure tags
  if (!lyrics.includes('[')) {
    issues.push('Липсват структурни тагове');
  }

  // Check for essential sections
  if (!/\[Verse/i.test(lyrics)) {
    issues.push('Липсва куплет (Verse)');
  }
  if (!/\[Chorus/i.test(lyrics)) {
    issues.push('Липсва припев (Chorus)');
  }

  // Check for Bulgarian content
  const cyrillicRegex = /[а-яА-Я]/;
  if (!cyrillicRegex.test(lyrics)) {
    issues.push('Текстът не съдържа български символи');
  }

  // Check minimum length
  const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['));
  if (lines.length < 15) {
    issues.push('Текстът е твърде кратък');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Format lyrics for display
export function formatLyricsForDisplay(lyrics: string): string {
  // Ensure proper spacing around tags
  return lyrics
    .replace(/\]\s*\[/g, ']\n\n[')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Parse lyrics into sections
export function parseLyricsIntoSections(lyrics: string): { tag: string; content: string }[] {
  const sections: { tag: string; content: string }[] = [];
  const parts = lyrics.split(/(\[[^\]]+\])/);

  let currentTag = '';
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentTag = trimmed.slice(1, -1);
    } else if (trimmed && currentTag) {
      sections.push({ tag: currentTag, content: trimmed });
      currentTag = '';
    }
  }

  return sections;
}
