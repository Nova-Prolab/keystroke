
"use client";

import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/i18nContext';
import { useToast } from '@/hooks/use-toast';
import type { FormattedCharacter } from '@/hooks/use-typing-test';
import type { FontSize } from '@/app/page';
import { cn } from '@/lib/utils';

interface SampleTextDisplayProps {
  formattedText: FormattedCharacter[];
  fontSize: FontSize;
}

const SampleTextDisplay: React.FC<SampleTextDisplayProps> = ({ formattedText, fontSize }) => {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleErrorClick = (expectedChar: string, actualChar: string | undefined, index: number) => {
    if (actualChar === undefined) return; 

    toast({
      title: t('errorDisplay.toastTitle'),
      description: t('errorDisplay.toastDescription', {
        index: index + 1, 
        expected: expectedChar === ' ' ? t('errorAnalysis.spaceChar') : `'${expectedChar}'`,
        actual: actualChar === ' ' ? t('errorAnalysis.spaceChar') : `'${actualChar}'`
      }),
      variant: "destructive"
    });
  };

  const fontSizeClasses: Record<FontSize, string> = {
    sm: 'text-lg md:text-xl', // Adjusted for better differentiation, base was text-xl
    base: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
  };

  return (
    <Card className="bg-card shadow-inner">
      <CardContent className="p-6">
        <p 
          className={cn(
            "leading-relaxed font-mono select-none whitespace-pre-wrap break-words",
            fontSizeClasses[fontSize]
          )}
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
