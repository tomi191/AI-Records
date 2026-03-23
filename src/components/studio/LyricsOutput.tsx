'use client';

import { Copy, Check, FileText } from 'lucide-react';
import { useState } from 'react';
import { Card, Button } from '@/components/ui';

interface LyricsOutputProps {
  lyrics: string;
  isStreaming: boolean;
}

export default function LyricsOutput({ lyrics, isStreaming }: LyricsOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!lyrics) return;

    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!lyrics && !isStreaming) {
    return (
      <Card variant="glass" padding="lg" className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.03] rounded-full mb-4">
          <FileText className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-2">Все още няма генериран текст</p>
        <p className="text-sm text-gray-600">
          Попълни темата и натисни &quot;Генерирай Текст&quot; за да създадеш песен
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Генериран Текст</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
              Генериране
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!lyrics || isStreaming}
          leftIcon={
            copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )
          }
        >
          {copied ? 'Копирано!' : 'Копирай'}
        </Button>
      </div>

      {/* Lyrics Content */}
      <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
        <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
          {lyrics}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-purple-400 animate-cursor ml-0.5" />
          )}
        </pre>
      </div>
    </Card>
  );
}
