
"use client";

import type React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TypingInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  onFocus?: () => void;
}

const TypingInputArea: React.FC<TypingInputAreaProps> = ({ value, onChange, disabled, inputRef, onFocus }) => {
  return (
    <Textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing here..."
      className="text-lg p-4 h-32 resize-none focus:ring-accent focus:ring-2 bg-background font-mono"
      disabled={disabled}
      aria-label="Typing input area"
      onFocus={onFocus}
      autoFocus
    />
  );
};

export default TypingInputArea;
