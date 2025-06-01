
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Delete } from 'lucide-react'; // Icon for Backspace
import { useI18n } from '@/contexts/i18nContext';

interface OnScreenKeyboardProps {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  className?: string;
}

const OnScreenKeyboard: React.FC<OnScreenKeyboardProps> = ({ onChar, onBackspace, onSpace, className }) => {
  const { t } = useI18n();

  // Simple QWERTY layout - lowercase only for this version
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  return (
    <div className={`p-2 md:p-3 bg-card rounded-lg shadow-lg mt-4 w-full max-w-xl mx-auto flex flex-col items-center space-y-1.5 md:space-y-2 ${className}`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1 md:space-x-1.5 w-full">
          {/* Special handling for indenting rows to somewhat mimic a real keyboard */}
          {rowIndex === 1 && <div className="w-4 md:w-6 shrink-0"></div>}
          {rowIndex === 2 && <div className="w-10 md:w-12 shrink-0"></div>}

          {row.map((char) => (
            <Button
              key={char}
              variant="outline"
              className="h-10 w-10 md:h-11 md:w-11 text-sm md:text-base p-0 flex-grow" // flex-grow helps fill space a bit
              onClick={() => onChar(char)}
              aria-label={char}
            >
              {char.toUpperCase()}
            </Button>
          ))}
          {rowIndex === rows.length - 1 && ( // Add Backspace to the last row of letters
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
      <div className="flex justify-center w-full px-1 md:px-0 mt-1 md:mt-1.5">
        <Button 
          variant="outline" 
          className="h-10 md:h-11 text-sm md:text-base px-4 flex-grow"
          style={{ minWidth: '200px', maxWidth: '400px' }} // Give spacebar a good width
          onClick={onSpace}
          aria-label={t('onScreenKeyboard.space')}
        >
          {t('onScreenKeyboard.space')}
        </Button>
      </div>
    </div>
  );
};

export default OnScreenKeyboard;
