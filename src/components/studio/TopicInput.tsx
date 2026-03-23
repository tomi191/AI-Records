'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { Textarea, Button } from '@/components/ui';

interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export default function TopicInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
}: TopicInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isGenerating && value.trim() && !disabled) {
        onGenerate();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Тема / Съдържание
        </h3>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-white/[0.03] border border-white/[0.08] rounded-md">
          <span className="text-[10px]">Ctrl</span>+<span className="text-[10px]">Enter</span>
        </kbd>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Опиши за какво да бъде песента...

Пример: Любовна история за двама души, които се срещат в София една дъждовна есенна вечер"
        className="min-h-[140px]"
        disabled={isGenerating || disabled}
      />

      <Button
        onClick={onGenerate}
        disabled={!value.trim() || isGenerating || disabled}
        isLoading={isGenerating}
        leftIcon={!isGenerating && <Sparkles className="w-4 h-4" />}
        className="w-full"
        size="lg"
      >
        {isGenerating ? 'Генериране...' : 'Генерирай Текст'}
      </Button>
    </div>
  );
}
