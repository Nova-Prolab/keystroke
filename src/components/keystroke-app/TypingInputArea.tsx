
"use client";

import type React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/contexts/i18nContext';

interface TypingInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onFocus?: () => void;
}

const TypingInputArea: React.FC<TypingInputAreaProps> = ({ value, onChange, disabled, inputRef, onFocus }) => {
  const { t } = useI18n();
  return (
    <Textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('typingInputPlaceholder')}
      className="text-lg p-4 h-32 resize-none focus:ring-accent focus:ring-2 bg-background font-mono"
      disabled={disabled}
      aria-label={t('typingInputAriaLabel')}
      onFocus={onFocus}
      autoFocus
    />
  );
};

export default TypingInputArea;
