'use client';

import { useState, useCallback } from 'react';
import { MusicStyle, Mood } from '@/lib/types';
import { useUserStore, CREDIT_COSTS } from '@/store/userStore';
import {
  StyleSelector,
  MoodSelector,
  TopicInput,
  LyricsOutput,
  SunoExport,
  CreditDisplay,
} from '@/components/studio';
import { Card } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function LyricsStudioPage() {
  const { user, deductCredits } = useUserStore();

  // State
  const [style, setStyle] = useState<MusicStyle>('chalga');
  const [mood, setMood] = useState<Mood>('romantic');
  const [topic, setTopic] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [stylePrompt, setStylePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnoughCredits = (user?.credits || 0) >= CREDIT_COSTS.lyrics;

  // Generate lyrics
  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || isGenerating || !hasEnoughCredits) return;

    setIsGenerating(true);
    setIsStreaming(true);
    setLyrics('');
    setStylePrompt('');
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ style, mood, topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let currentLyrics = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'meta') {
                setStylePrompt(data.stylePrompt);
              } else if (data.type === 'chunk') {
                currentLyrics += data.content;
                setLyrics(currentLyrics);
              } else if (data.type === 'complete') {
                setLyrics(data.lyrics);
                setIsStreaming(false);
                // Deduct credits after successful generation
                deductCredits(CREDIT_COSTS.lyrics);
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsStreaming(false);
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
    }
  }, [style, mood, topic, isGenerating, hasEnoughCredits, deductCredits]);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Генератор на Текстове</h1>
          <p className="text-gray-400">
            Създавай професионални български текстове за песни
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Style & Mood */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <Card variant="glass" padding="md">
              <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
            </Card>
            <Card variant="glass" padding="md">
              <MoodSelector selectedMood={mood} onMoodChange={setMood} />
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Credit Display */}
            <CreditDisplay type="lyrics" />

            {/* Topic Input */}
            <Card variant="glass" padding="md">
              <TopicInput
                value={topic}
                onChange={setTopic}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                disabled={!hasEnoughCredits}
              />
            </Card>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Lyrics Output */}
            <LyricsOutput lyrics={lyrics} isStreaming={isStreaming} />

            {/* SUNO Export */}
            <SunoExport lyrics={lyrics} stylePrompt={stylePrompt} />
          </div>
        </div>
      </div>
    </div>
  );
}
