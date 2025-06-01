
"use client";

import type React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/contexts/i18nContext';
import type { FontSize } from '@/app/page';
import { cn } from '@/lib/utils';

interface TypingInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  readOnly?: boolean; // New prop
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onFocus?: () => void;
  fontSize: FontSize;
}

const TypingInputArea: React.FC<TypingInputAreaProps> = ({ 
  value, 
  onChange, 
  disabled, 
  readOnly, 
  inputRef, 
  onFocus, 
  fontSize 
}) => {
  const { t } = useI18n();

  const fontSizeClasses: Record<FontSize, string> = {
    sm: 'text-md md:text-lg', 
    base: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
  };

  return (
    <Textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('typingInputPlaceholder')}
      className={cn(
        "p-4 h-32 resize-none focus:ring-accent focus:ring-2 bg-background font-mono",
        fontSizeClasses[fontSize],
        readOnly && "cursor-default text-muted-foreground" // Style when readOnly (OSK active)
      )}
      disabled={disabled}
      readOnly={readOnly} // Apply readOnly prop
      aria-label={t('typingInputAriaLabel')}
      onFocus={onFocus}
      autoFocus
    />
  );
};

export default TypingInputArea;
