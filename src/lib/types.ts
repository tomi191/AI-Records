// Music Styles
export type MusicStyle =
  | 'pop'
  | 'rock'
  | 'hip-hop'
  | 'electronic'
  | 'rnb'
  | 'chalga'
  | 'folk'
  | 'ballad';

// Moods
export type Mood =
  | 'happy'      // Весело
  | 'sad'        // Тъжно
  | 'romantic'   // Романтично
  | 'energetic'  // Енергично
  | 'aggressive' // Агресивно
  | 'melancholic'// Меланхолично
  | 'hopeful'    // Надеждно
  | 'nostalgic'; // Носталгично

// Style configuration with SUNO prompt
export interface StyleConfig {
  id: MusicStyle;
  name: string;
  nameBg: string;
  description: string;
  tempo: string;
  sunoPrompt: string;
  typicalStructure: string[];
  icon: string;
}

// Mood configuration
export interface MoodConfig {
  id: Mood;
  name: string;
  nameBg: string;
  icon: string;
  keywords: string[];
}

// Generation request
export interface GenerationRequest {
  style: MusicStyle;
  mood: Mood;
  topic: string;
  language?: 'bg' | 'en';
  includeStylePrompt?: boolean;
}

// Generation response
export interface GenerationResponse {
  lyrics: string;
  stylePrompt: string;
  structure: string[];
  metadata: {
    style: MusicStyle;
    mood: Mood;
    topic: string;
    generatedAt: string;
  };
}

// Training example
export interface TrainingExample {
  id: string;
  title: string;
  style: MusicStyle;
  mood: Mood;
  lyrics: string;
  source?: string;
}

// SUNO metatag
export interface SunoMetatag {
  tag: string;
  description: string;
  category: 'structure' | 'voice' | 'effect' | 'instruction';
  example?: string;
}
