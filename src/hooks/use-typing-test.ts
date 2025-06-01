
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/contexts/i18nContext';

const ALL_SAMPLE_TEXTS: Record<string, string[]> = {
  en: [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Programming is the art of telling another human being what one wants the computer to do. The purpose of software engineering is to control complexity, not to create it.",
    "In the midst of chaos, there is also opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. The only way to do great work is to love what you do."
  ],
  es: [
    "El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja. ¡Qué fácil es escribir en español ahora!",
    "Programar es el arte de decirle a otro ser humano lo que uno quiere que haga la computadora. El propósito de la ingeniería de software es controlar la complejidad, no crearla.",
    "En medio del caos, también hay oportunidad. La mayor gloria de vivir no consiste en no caer nunca, sino en levantarse cada vez que caemos.",
    "Ser tú mismo en un mundo que constantemente intenta convertirte en otra cosa es el mayor logro. La única forma de hacer un gran trabajo es amar lo que haces."
  ],
  pt: [
    "A rápida raposa marrom salta sobre o cão preguiçoso. Leve uísque Fagundes para casa hoje à noite. Zebras caolhas de Java querem passar num pequeno túnel.",
    "Programar é a arte de dizer a outro ser humano o que se quer que o computador faça. O propósito da engenharia de software é controlar a complexidade, não criá-la.",
    "No meio do caos, há também oportunidade. A maior glória de viver não reside em nunca cair, mas em nos levantarmos sempre que caímos.",
    "Ser você mesmo em um mundo que está constantemente tentando fazer de você outra coisa é a maior realização. A única maneira de fazer um ótimo trabalho é amar o que você faz."
  ],
};


export type Keystroke = {
  char: string;
  timestamp: number;
  inputChar: string;
  status: 'correct' | 'incorrect' | 'corrected';
};

export type ErrorRecord = {
  expected: string;
  actual: string;
  index: number;
};

export type TypingStats = {
  wpm: number;
  cpm: number;
  wps: number;
  accuracy: number;
  timeElapsed: number; // in seconds
};

export type FormattedCharacter = {
  char: string;
  className: string;
  key: string;
  actualChar?: string;
  originalIndex: number;
};

const getNewSampleText = (locale: string): string => {
  const textsForLocale = ALL_SAMPLE_TEXTS[locale] || ALL_SAMPLE_TEXTS['en'];
  return textsForLocale[Math.floor(Math.random() * textsForLocale.length)];
};

export function useTypingTest() {
  const { locale, isInitialized: i18nInitialized } = useI18n();
  
  const [sampleText, setSampleText] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, cpm: 0, wps: 0, accuracy: 100, timeElapsed: 0 });
  const [keystrokeHistory, setKeystrokeHistory] = useState<Keystroke[]>([]);
  const [errors, setErrors] = useState<ErrorRecord[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (i18nInitialized) {
      setSampleText(getNewSampleText(locale));
    }
  }, [locale, i18nInitialized]);


  const resetTest = useCallback(() => {
    setSessionActive(false);
    setTypedText("");
    setStartTime(null);
    setEndTime(null);
    setStats({ wpm: 0, cpm: 0, wps: 0, accuracy: 100, timeElapsed: 0 });
    setKeystrokeHistory([]);
    setErrors([]);
    if (i18nInitialized) {
      setSampleText(getNewSampleText(locale));
    }
    if (inputRef.current) {
       inputRef.current.focus();
    }
  }, [locale, i18nInitialized]);

  const startTest = useCallback(() => {
    if (sessionActive) return;
    resetTest(); 
    setSessionActive(true);
    setStartTime(Date.now());
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [resetTest, sessionActive]);
  

  useEffect(() => {
    if (!sessionActive || !startTime || !sampleText) return;

    const calculateStats = () => {
      const now = endTime || Date.now(); // Use endTime if test is finished
      const timeElapsedSeconds = (now - startTime) / 1000;
      if (timeElapsedSeconds <= 0) return;

      let correctChars = 0;
      for (let i = 0; i < typedText.length && i < sampleText.length; i++) {
        if (typedText[i] === sampleText[i]) {
          correctChars++;
        }
      }
      
      const cpm = Math.round((correctChars / timeElapsedSeconds) * 60) || 0;
      const wpm = Math.round(cpm / 5) || 0; 
      const wps = Math.round(wpm / 60) || 0;
      const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;

      setStats({ wpm, cpm, wps, accuracy, timeElapsed: parseFloat(timeElapsedSeconds.toFixed(1)) });
    };

    if (typedText.length === sampleText.length && !endTime) {
        const finalEndTime = Date.now();
        setEndTime(finalEndTime);
        setSessionActive(false);
         // Perform final calculation using the exact end time
        const timeElapsedSeconds = (finalEndTime - startTime) / 1000;
        if (timeElapsedSeconds > 0) {
            let correctChars = 0;
            for (let i = 0; i < typedText.length && i < sampleText.length; i++) {
                if (typedText[i] === sampleText[i]) {
                correctChars++;
                }
            }
            const cpm = Math.round((correctChars / timeElapsedSeconds) * 60) || 0;
            const wpm = Math.round(cpm / 5) || 0;
            const wps = Math.round(wpm / 60) || 0;
            const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;
            setStats({ wpm, cpm, wps, accuracy, timeElapsed: parseFloat(timeElapsedSeconds.toFixed(1)) });
        }
        return; // No interval needed if test is finished
    }

    const intervalId = setInterval(calculateStats, 500);
    
    return () => clearInterval(intervalId);
  }, [sessionActive, startTime, typedText, sampleText, endTime]);

  const handleInputChange = (currentTypedText: string) => {
    if (endTime || !sampleText) return; 

    if (!sessionActive && currentTypedText.length > 0) {
      setSessionActive(true);
      setStartTime(Date.now());
    }
    
    setTypedText(currentTypedText);

    const currentIndex = currentTypedText.length - 1;

    if (currentIndex >= 0 && currentIndex < sampleText.length) {
      const expectedChar = sampleText[currentIndex];
      const typedChar = currentTypedText[currentIndex];
      const isCorrect = typedChar === expectedChar;
      
      const newKeystroke: Keystroke = {
        char: expectedChar, 
        timestamp: Date.now(),
        inputChar: typedChar, 
        status: isCorrect ? 'correct' : 'incorrect',
      };
      
      if (currentTypedText.length > keystrokeHistory.length) {
        setKeystrokeHistory(prev => [...prev, newKeystroke]);
      }


      if (!isCorrect) {
        setErrors(prevErrors => {
          const existingErrorIndex = prevErrors.findIndex(err => err.index === currentIndex);
          if (existingErrorIndex !== -1) {
            if (prevErrors[existingErrorIndex].actual !== typedChar) {
              const updatedErrors = [...prevErrors];
              updatedErrors[existingErrorIndex] = { expected: expectedChar, actual: typedChar, index: currentIndex };
              return updatedErrors;
            }
            return prevErrors;
          }
          return [...prevErrors, { expected: expectedChar, actual: typedChar, index: currentIndex }];
        });
      } else {
        setErrors(prevErrors => prevErrors.filter(err => err.index !== currentIndex));
      }
    } else if (currentIndex >= sampleText.length -1 ) { // -1 because length is 1-based, index is 0-based
      // If typed text length equals sample text length, it's effectively done
      if (currentTypedText.length === sampleText.length && !endTime) {
        setEndTime(Date.now());
        setSessionActive(false);
      }
    }
  };
  
  const getFormattedSampleText = useCallback((): FormattedCharacter[] => {
    if (!sampleText) return [];
    return sampleText.split('').map((char, index) => {
      let status: 'correct' | 'incorrect' | 'pending' = 'pending';
      let actualCharValue: string | undefined = undefined;
      
      if (index < typedText.length) {
        status = typedText[index] === char ? 'correct' : 'incorrect';
        if (status === 'incorrect') {
          actualCharValue = typedText[index];
        }
      }
      
      let className = "text-muted-foreground"; 
      if (index === typedText.length && sessionActive) {
        className = "text-foreground animate-pulse border-b-2 border-accent";
      } else if (status === 'correct') {
        className = "text-green-600 dark:text-green-400 font-medium";
      } else if (status === 'incorrect') {
        className = "text-red-100 bg-red-600 dark:text-red-200 dark:bg-red-700/80 p-px rounded-sm cursor-pointer font-semibold";
      }

      return { 
        char, 
        className, 
        key: `${char}-${index}-${status}`, // Make key more unique if char can repeat
        actualChar: actualCharValue,
        originalIndex: index 
      };
    });
  }, [sampleText, typedText, sessionActive]);


  return {
    sampleText,
    typedText,
    sessionActive,
    stats,
    keystrokeHistory,
    errors,
    inputRef,
    handleInputChange,
    resetTest,
    startTest,
    formattedSampleText: getFormattedSampleText(),
    timeElapsed: stats.timeElapsed,
    isReady: i18nInitialized && sampleText !== "", // Add a flag to indicate if the hook is ready
  };
}

