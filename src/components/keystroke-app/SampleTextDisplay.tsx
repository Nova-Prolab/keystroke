
"use client";

import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18nContext';
import { useToast } from '@/hooks/use-toast';
import type { FormattedCharacter } from '@/hooks/use-typing-test';

interface SampleTextDisplayProps {
  formattedText: FormattedCharacter[];
}

const SampleTextDisplay: React.FC<SampleTextDisplayProps> = ({ formattedText }) => {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleErrorClick = (expectedChar: string, actualChar: string | undefined, index: number) => {
    if (actualChar === undefined) return; // Should not happen for incorrect chars

    toast({
      title: t('errorDisplay.toastTitle'),
      description: t('errorDisplay.toastDescription', {
        index: index + 1, // User-facing index should be 1-based
        expected: expectedChar === ' ' ? t('errorAnalysis.spaceChar') : `'${expectedChar}'`,
        actual: actualChar === ' ' ? t('errorAnalysis.spaceChar') : `'${actualChar}'`
      }),
      variant: "destructive"
    });
  };

  return (
    <Card className="bg-card shadow-inner">
      <CardContent className="p-6">
        <p 
          className="text-xl leading-relaxed font-mono select-none whitespace-pre-wrap break-words" 
          aria-label={t('sampleTextAriaLabel')}
        >
          {formattedText.map(item => (
            <span 
              key={item.key} 
              className={item.className}
              onClick={item.actualChar ? () => handleErrorClick(item.char, item.actualChar, item.originalIndex) : undefined}
            >
              {item.char === ' ' ? '\u00A0' : item.char}
            </span>
          ))}
        </p>
      </CardContent>
    </Card>
  );
};

export default SampleTextDisplay;
