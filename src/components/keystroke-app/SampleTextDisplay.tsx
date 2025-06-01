
"use client";

import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18nContext';

interface SampleTextDisplayProps {
  formattedText: Array<{ char: string; className: string; key: string }>;
}

const SampleTextDisplay: React.FC<SampleTextDisplayProps> = ({ formattedText }) => {
  const { t } = useI18n();
  return (
    <Card className="bg-card shadow-inner">
      <CardContent className="p-6">
        <p 
          className="text-xl leading-relaxed font-mono select-none whitespace-pre-wrap break-words" 
          aria-label={t('sampleTextAriaLabel')}
        >
          {formattedText.map(item => (
            <span key={item.key} className={item.className}>
              {item.char === ' ' ? '\u00A0' : item.char}
            </span>
          ))}
        </p>
      </CardContent>
    </Card>
  );
};

export default SampleTextDisplay;
