
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
  "Programming is the art of telling another human being what one wants the computer to do. The purpose of software engineering is to control complexity, not to create it.",
  "In the midst of chaos, there is also opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. The only way to do great work is to love what you do."
];

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

const getNewSampleText = () => SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];

export function useTypingTest() {
  const [sampleText, setSampleText] = useState<string>(getNewSampleText());
  const [typedText, setTypedText] = useState<string>("");
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, cpm: 0, wps: 0, accuracy: 100, timeElapsed: 0 });
  const [keystrokeHistory, setKeystrokeHistory] = useState<Keystroke[]>([]);
  const [errors, setErrors] = useState<ErrorRecord[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const resetTest = useCallback(() => {
    setSessionActive(false);
    setTypedText("");
    setStartTime(null);
    setEndTime(null);
    setStats({ wpm: 0, cpm: 0, wps: 0, accuracy: 100, timeElapsed: 0 });
    setKeystrokeHistory([]);
    setErrors([]);
    setSampleText(getNewSampleText());
    if (inputRef.current) {
       inputRef.current.focus();
    }
  }, []);

  const startTest = useCallback(() => {
    if (sessionActive) return;
    resetTest(); // Reset before starting a new one if called explicitly
    setSessionActive(true);
    setStartTime(Date.now());
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [resetTest, sessionActive]);
  

  useEffect(() => {
    if (!sessionActive || !startTime) return;

    const calculateStats = () => {
      const now = Date.now();
      const timeElapsedSeconds = (now - startTime) / 1000;
      if (timeElapsedSeconds <= 0) return;

      const wordsTyped = typedText.trim().split(/\s+/).filter(Boolean).length;
      // Calculate correct characters based on typedText against sampleText up to the current typed length
      let correctChars = 0;
      for (let i = 0; i < typedText.length; i++) {
        if (i < sampleText.length && typedText[i] === sampleText[i]) {
          correctChars++;
        }
      }
      
      const cpm = Math.round((correctChars / timeElapsedSeconds) * 60) || 0;
      const wpm = Math.round(cpm / 5) || 0; // Standard calculation: 5 chars per word
      const wps = Math.round(wpm / 60) || 0;
      const accuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100;

      setStats({ wpm, cpm, wps, accuracy, timeElapsed: parseFloat(timeElapsedSeconds.toFixed(1)) });
    };

    const intervalId = setInterval(calculateStats, 500); // Update stats every 0.5 seconds

    if (typedText.length === sampleText.length && !endTime) {
        setEndTime(Date.now());
        setSessionActive(false);
        calculateStats(); // Final calculation
    }
    
    return () => clearInterval(intervalId);
  }, [sessionActive, startTime, typedText, sampleText, endTime]);

  const handleInputChange = (currentTypedText: string) => {
    if (endTime) return; // Session finished

    if (!sessionActive && currentTypedText.length > 0) {
      setSessionActive(true);
      setStartTime(Date.now());
    }
    
    setTypedText(currentTypedText);

    // Basic keystroke logging and error tracking
    // This logic will be slightly adjusted as error tracking is on whole typed string
    // For simplicity, this example tracks error per char on input.
    const currentIndex = currentTypedText.length - 1;

    if (currentIndex >= 0 && currentIndex < sampleText.length) {
      const expectedChar = sampleText[currentIndex];
      const typedChar = currentTypedText[currentIndex];
      const isCorrect = typedChar === expectedChar;
      
      const newKeystroke: Keystroke = {
        char: expectedChar, // what was expected
        timestamp: Date.now(),
        inputChar: typedChar, // what was typed
        status: isCorrect ? 'correct' : 'incorrect',
      };
      // Only add new keystrokes, avoid re-adding on backspace for this specific history
      // More robust history would handle backspace as 'corrected' events
      if (currentTypedText.length > keystrokeHistory.length) {
        setKeystrokeHistory(prev => [...prev, newKeystroke]);
      }


      if (!isCorrect) {
         // Avoid duplicate errors for the same index if user backspaces and re-types incorrectly
        setErrors(prevErrors => {
          const existingErrorIndex = prevErrors.findIndex(err => err.index === currentIndex);
          if (existingErrorIndex !== -1) {
            // Update existing error if it changed
            if (prevErrors[existingErrorIndex].actual !== typedChar) {
              const updatedErrors = [...prevErrors];
              updatedErrors[existingErrorIndex] = { expected: expectedChar, actual: typedChar, index: currentIndex };
              return updatedErrors;
            }
            return prevErrors;
          }
          // Add new error
          return [...prevErrors, { expected: expectedChar, actual: typedChar, index: currentIndex }];
        });
      } else {
        // If character is now correct, remove previous error at this index if any
        setErrors(prevErrors => prevErrors.filter(err => err.index !== currentIndex));
      }
    } else if (currentIndex >= sampleText.length) {
      // User typed beyond sample text length
      setSessionActive(false);
      setEndTime(Date.now());
    }
  };
  
  const getFormattedSampleText = useCallback(() => {
    return sampleText.split('').map((char, index) => {
      let status: 'correct' | 'incorrect' | 'pending' | 'extra' = 'pending';
      let displayChar = char;

      if (index < typedText.length) {
        if (typedText[index] === char) {
          status = 'correct';
        } else {
          status = 'incorrect';
        }
      }
      
      let className = "text-muted-foreground"; 
      if (index === typedText.length && sessionActive) {
        className = "text-foreground animate-pulse border-b-2 border-accent";
      } else if (status === 'correct') {
        className = "text-green-500";
      } else if (status === 'incorrect') {
        className = "text-red-500 bg-red-100 dark:bg-red-900";
      }


      return { char: displayChar, className, key: `${char}-${index}` };
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
  };
}
