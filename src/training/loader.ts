import { TrainingExample, MusicStyle, Mood } from '@/lib/types';

// In-memory storage for custom training examples
let customExamples: TrainingExample[] = [];

// Parse a text file into a training example
export function parseTrainingFile(
  content: string,
  filename: string,
  style: MusicStyle = 'pop',
  mood: Mood = 'romantic'
): TrainingExample {
  // Try to extract title from filename or first line
  const lines = content.trim().split('\n');
  let title = filename.replace(/\.txt$/i, '').replace(/_/g, ' ');

  // If first line looks like a title (short, no brackets), use it
  if (lines[0] && lines[0].length < 50 && !lines[0].includes('[')) {
    title = lines[0].trim();
  }

  // Try to detect style from content
  const detectedStyle = detectStyleFromContent(content);
  const detectedMood = detectMoodFromContent(content);

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    style: detectedStyle || style,
    mood: detectedMood || mood,
    lyrics: content.trim(),
    source: 'custom',
  };
}

// Detect music style from lyrics content
function detectStyleFromContent(content: string): MusicStyle | null {
  const lowerContent = content.toLowerCase();

  // Check for genre-specific markers
  if (lowerContent.includes('[rap]') || lowerContent.includes('йо') || lowerContent.includes('хъсъл')) {
    return 'hip-hop';
  }
  if (lowerContent.includes('[drop]') || lowerContent.includes('drop')) {
    return 'electronic';
  }
  if (lowerContent.includes('хоро') || lowerContent.includes('гайда') || lowerContent.includes('село')) {
    return 'folk';
  }
  if (lowerContent.includes('кючек') || lowerContent.includes('купон') || lowerContent.includes('vip')) {
    return 'chalga';
  }
  if (lowerContent.includes('[solo]') || lowerContent.includes('китара')) {
    return 'rock';
  }
  if (lowerContent.includes('(piano)') || lowerContent.includes('(strings)')) {
    return 'ballad';
  }

  return null;
}

// Detect mood from lyrics content
function detectMoodFromContent(content: string): Mood | null {
  const lowerContent = content.toLowerCase();

  // Count emotional keywords
  const emotions: Record<Mood, number> = {
    happy: 0,
    sad: 0,
    romantic: 0,
    energetic: 0,
    aggressive: 0,
    melancholic: 0,
    hopeful: 0,
    nostalgic: 0,
  };

  // Happy keywords
  const happyWords = ['щастие', 'радост', 'слънце', 'усмивка', 'танц', 'празник', 'весел'];
  happyWords.forEach(w => { if (lowerContent.includes(w)) emotions.happy++; });

  // Sad keywords
  const sadWords = ['сълза', 'тъга', 'болка', 'самота', 'край', 'загуба', 'плач'];
  sadWords.forEach(w => { if (lowerContent.includes(w)) emotions.sad++; });

  // Romantic keywords
  const romanticWords = ['любов', 'целувка', 'сърце', 'обич', 'прегръдка', 'страст'];
  romanticWords.forEach(w => { if (lowerContent.includes(w)) emotions.romantic++; });

  // Energetic keywords
  const energeticWords = ['сила', 'енергия', 'полет', 'огън', 'мощ', 'скорост'];
  energeticWords.forEach(w => { if (lowerContent.includes(w)) emotions.energetic++; });

  // Find dominant emotion
  let maxEmotion: Mood = 'romantic';
  let maxCount = 0;

  (Object.keys(emotions) as Mood[]).forEach(mood => {
    if (emotions[mood] > maxCount) {
      maxCount = emotions[mood];
      maxEmotion = mood;
    }
  });

  return maxCount > 0 ? maxEmotion : null;
}

// Add a custom training example
export function addCustomExample(example: TrainingExample): void {
  customExamples.push(example);
}

// Get all custom examples
export function getCustomExamples(): TrainingExample[] {
  return customExamples;
}

// Clear custom examples
export function clearCustomExamples(): void {
  customExamples = [];
}

// Remove a specific custom example
export function removeCustomExample(id: string): void {
  customExamples = customExamples.filter(ex => ex.id !== id);
}

// Get custom examples by style
export function getCustomExamplesByStyle(style: MusicStyle): TrainingExample[] {
  return customExamples.filter(ex => ex.style === style);
}

// Validate lyrics format (check for SUNO metatags)
export function validateLyricsFormat(content: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for at least one structure tag
  if (!content.includes('[')) {
    issues.push('Липсват структурни тагове като [Verse], [Chorus] и т.н.');
  }

  // Check for common structure elements
  const hasVerse = /\[Verse/i.test(content);
  const hasChorus = /\[Chorus/i.test(content);

  if (!hasVerse && !hasChorus) {
    issues.push('Препоръчително е да има поне [Verse] или [Chorus]');
  }

  // Check for reasonable length
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 10) {
    issues.push('Текстът изглежда твърде кратък');
  }
  if (lines.length > 100) {
    issues.push('Текстът изглежда твърде дълъг');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
