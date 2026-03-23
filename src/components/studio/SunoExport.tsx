'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Wand2 } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';

interface SunoExportProps {
  lyrics: string;
  stylePrompt: string;
}

export default function SunoExport({ lyrics, stylePrompt }: SunoExportProps) {
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const [copiedStyle, setCopiedStyle] = useState(false);

  const handleCopyLyrics = async () => {
    if (!lyrics) return;
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyStyle = async () => {
    if (!stylePrompt) return;
    try {
      await navigator.clipboard.writeText(stylePrompt);
      setCopiedStyle(true);
      setTimeout(() => setCopiedStyle(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!lyrics || !stylePrompt) {
    return null;
  }

  return (
    <Card variant="gradient" padding="lg" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Експорт за Генериране</h3>
          <p className="text-sm text-gray-400">Копирай съдържанието за създаване на музика</p>
        </div>
      </div>

      {/* Style Prompt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">Стилов Промпт</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyStyle}
            leftIcon={
              copiedStyle ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
          >
            {copiedStyle ? 'Копирано!' : 'Копирай'}
          </Button>
        </div>
        <div className="p-4 bg-black/20 rounded-xl border border-white/[0.05]">
          <p className="text-sm text-gray-200 break-words">{stylePrompt}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Открити Тагове</label>
        <div className="flex flex-wrap gap-2">
          {stylePrompt.split(',').slice(0, 6).map((tag, i) => (
            <Badge key={i} variant="purple" size="sm">
              {tag.trim()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/[0.05]">
        <Button
          variant="primary"
          className="flex-1"
          onClick={handleCopyLyrics}
          leftIcon={
            copiedLyrics ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )
          }
        >
          {copiedLyrics ? 'Текстът е копиран!' : 'Копирай Текста'}
        </Button>
        <a
          href="https://suno.ai/create"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-300 hover:text-purple-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-all"
        >
          Създай Музика
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
}
