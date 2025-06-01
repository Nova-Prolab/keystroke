
"use client";

import React from 'react'; // Added React import
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, CornerLeftUp, ArrowUpWideNarrow } from 'lucide-react'; // Icons
import { useI18n } from '@/contexts/i18nContext';
import { cn } from '@/lib/utils';

interface OnScreenKeyboardProps {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  className?: string;
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ onChar, onBackspace, onSpace, className }) => {
  const { t } = useI18n();
  const [shiftActive, setShiftActive] = useState(false);

  const handleCharClick = (char: string) => {
    onChar(shiftActive ? char.toUpperCase() : char.toLowerCase());
    if (shiftActive) {
      setShiftActive(false); // Momentary shift
    }
  };

  const handleShiftToggle = () => {
    setShiftActive(prev => !prev);
  };

  const layout = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.'],
    ['SPACE'],
  ];

  return (
    <div className={cn("p-2 md:p-3 bg-card rounded-lg shadow-lg mt-4 w-full max-w-2xl mx-auto flex flex-col items-center space-y-1 md:space-y-1.5", className)}>
      {layout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1 md:space-x-1.5 w-full">
          {row.map((key) => {
            if (key === 'SHIFT') {
              return (
                <Button
                  key={key}
                  variant={shiftActive ? "secondary" : "outline"}
                  className="h-10 w-16 md:h-11 md:w-20 text-xs md:text-sm p-0 flex-grow"
                  onClick={handleShiftToggle}
                  aria-label={t('onScreenKeyboard.shift')}
                >
                  <ArrowUpWideNarrow className="w-4 h-4 md:w-5 md:h-5 inline-block mr-0.5" />
                  <span className="hidden sm:inline">{t('onScreenKeyboard.shift')}</span>
                </Button>
              );
            }
            if (key === 'SPACE') {
              return (
                <Button
                  key={key}
                  variant="outline"
                  className="h-10 md:h-11 text-sm md:text-base px-4 flex-grow"
                  style={{ minWidth: '250px', maxWidth: '500px' }}
                  onClick={onSpace}
                  aria-label={t('onScreenKeyboard.space')}
                >
                  {t('onScreenKeyboard.space')}
                </Button>
              );
            }
            // Group Backspace with the last row of characters for better layout control
            if (rowIndex === layout.length - 2 && key === '.') { // Assuming Backspace is conceptually after '.'
              return (
                <React.Fragment key="punctuation-and-backspace">
                  <Button
                    key="."
                    variant="outline"
                    className="h-10 w-10 md:h-11 md:w-11 text-sm md:text-base p-0 flex-grow"
                    onClick={() => handleCharClick('.')}
                    aria-label="."
                  >
                    .
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 w-16 md:h-11 md:w-20 text-xs md:text-sm p-0 flex-grow"
                    onClick={onBackspace}
                    aria-label={t('onScreenKeyboard.backspace')}
                  >
                    <Delete className="w-4 h-4 md:w-5 md:h-5 inline-block mr-1" />
                    <span className="hidden sm:inline">{t('onScreenKeyboard.backspace')}</span>
                  </Button>
                </React.Fragment>
              );
            }
             if (key === ',' || key === '.') {
               return (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-10 w-10 md:h-11 md:w-11 text-sm md:text-base p-0 flex-grow"
                    onClick={() => handleCharClick(key)}
                    aria-label={key}
                  >
                    {key}
                  </Button>
               );
             }

            // Regular character keys
            return (
              <Button
                key={key}
                variant="outline"
                className="h-10 w-10 md:h-11 md:w-11 text-sm md:text-base p-0 flex-grow"
                onClick={() => handleCharClick(key)}
                aria-label={shiftActive ? key.toUpperCase() : key.toLowerCase()}
              >
                {shiftActive ? key.toUpperCase() : key.toLowerCase()}
              </Button>
            );
          })}
           {/* Add Backspace to the end of the third row if not handled with period */}
           {rowIndex === 2 && !row.includes('.') && (
             <Button
                variant="outline"
                className="h-10 w-16 md:h-11 md:w-20 text-xs md:text-sm p-0 flex-grow"
                onClick={onBackspace}
                aria-label={t('onScreenKeyboard.backspace')}
              >
                <Delete className="w-4 h-4 md:w-5 md:h-5 inline-block mr-1" />
                <span className="hidden sm:inline">{t('onScreenKeyboard.backspace')}</span>
              </Button>
           )}
        </div>
      ))}
    </div>
  );
};

export default OnScreenKeyboard;
