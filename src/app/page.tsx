
"use client";

import type React from 'react';
import { useState, useEffect, useCallback }from 'react';
import { useTypingTest } from '@/hooks/use-typing-test';
import SampleTextDisplay from '@/components/keystroke-app/SampleTextDisplay';
import TypingInputArea from '@/components/keystroke-app/TypingInputArea';
import StatsDisplay from '@/components/keystroke-app/StatsDisplay';
import Controls from '@/components/keystroke-app/Controls';
import ErrorAnalysisDisplay from '@/components/keystroke-app/ErrorAnalysisDisplay';
import KeystrokeHistoryDisplay from '@/components/keystroke-app/KeystrokeHistoryDisplay';
import SettingsDialog from '@/components/keystroke-app/SettingsDialog';
import OnScreenKeyboard from '@/components/keystroke-app/OnScreenKeyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/contexts/i18nContext';

export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'base' | 'lg';

export default function KeystrokeInsightsPage() {
  const { t, isInitialized: i18nReady } = useI18n();
  const {
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
    formattedSampleText,
    isReady: typingTestReady,
    endTime, // Added endTime from useTypingTest
  } = useTypingTest();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  // Settings State
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [showErrorAnalysis, setShowErrorAnalysis] = useState<boolean>(true);
  const [showKeystrokeHistory, setShowKeystrokeHistory] = useState<boolean>(true);
  const [useOnScreenKeyboard, setUseOnScreenKeyboard] = useState<boolean>(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    } catch (e) {
      console.warn("AudioContext not supported or could not be initialized.", e);
      if (i18nReady) {
        toast({
          title: t('audioWarningTitle'),
          description: t('audioWarningDesc'),
          variant: "destructive"
        });
      }
    }

    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      setTheme('light'); // Default to light
      document.documentElement.classList.toggle('dark', false);
    }

    const storedFontSize = localStorage.getItem('fontSize') as FontSize | null;
    if (storedFontSize) setFontSize(storedFontSize);

    const storedShowError = localStorage.getItem('showErrorAnalysis');
    if (storedShowError !== null) setShowErrorAnalysis(JSON.parse(storedShowError));
    
    const storedShowHistory = localStorage.getItem('showKeystrokeHistory');
    if (storedShowHistory !== null) setShowKeystrokeHistory(JSON.parse(storedShowHistory));

    const storedUseOSK = localStorage.getItem('useOnScreenKeyboard');
    if (storedUseOSK !== null) setUseOnScreenKeyboard(JSON.parse(storedUseOSK));

    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.warn("Failed to close AudioContext:", err));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18nReady]); 

  useEffect(() => {
    if (i18nReady) {
      document.title = t('pageTitle');
    }
  }, [i18nReady, t]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const handleFontSizeChange = (newSize: FontSize) => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
  };

  const handleShowErrorAnalysisChange = (show: boolean) => {
    setShowErrorAnalysis(show);
    localStorage.setItem('showErrorAnalysis', JSON.stringify(show));
  };

  const handleShowKeystrokeHistoryChange = (show: boolean) => {
    setShowKeystrokeHistory(show);
    localStorage.setItem('showKeystrokeHistory', JSON.stringify(show));
  };

  const handleUseOnScreenKeyboardChange = (useOSK: boolean) => {
    setUseOnScreenKeyboard(useOSK);
    localStorage.setItem('useOnScreenKeyboard', JSON.stringify(useOSK));
    if (!useOSK && inputRef.current) { // If switching back to physical, focus textarea
        inputRef.current.focus();
    }
  };

  const playKeystrokeSound = useCallback(() => {
    if (soundEnabled && audioContext && audioContext.state === 'running') {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine'; 
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime); 
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); 

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05); 
      } catch (e) {
        console.error("Error playing sound:", e);
      }
    }
  }, [soundEnabled, audioContext]);

  const localHandleInputChange = (value: string) => {
    if (!sampleText) return;
    handleInputChange(value); // This comes from useTypingTest hook
    if (sessionActive || (!sessionActive && value.length > 0 && value.length < sampleText.length)) { 
      playKeystrokeSound();
    }
  };
  
  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    if (enabled && audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.error("Failed to resume AudioContext:", err);
        if (i18nReady) {
          toast({
            title: t('audioErrorTitle'),
            description: t('audioErrorDesc'),
            variant: "destructive"
          });
        }
      });
    }
  };
  
  const handleInputFocus = () => {
     if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(err => console.warn("Could not resume audio context on focus:", err));
    }
  };

  // On-Screen Keyboard Handlers
  const handleOSKChar = (char: string) => {
    if (endTime || !sampleText || (typedText.length >= sampleText.length)) return;
    const newTypedText = typedText + char;
    localHandleInputChange(newTypedText);
  };

  const handleOSKBackspace = () => {
    if (endTime || !sampleText || typedText.length === 0) return;
    const newTypedText = typedText.slice(0, -1);
    localHandleInputChange(newTypedText);
  };

  const handleOSKSpace = () => {
    if (endTime || !sampleText || (typedText.length >= sampleText.length)) return;
    const newTypedText = typedText + ' ';
    localHandleInputChange(newTypedText);
  };
  
  const isTestFinished = sampleText && typedText.length === sampleText.length && !sessionActive && stats.timeElapsed > 0;

  if (!isMounted || !i18nReady || !typingTestReady || !sampleText) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Keyboard className="h-16 w-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background text-foreground">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary flex items-center justify-center">
            <Keyboard className="mr-3 h-10 w-10 md:h-12 md:w-12 text-accent" />
            {t('headerTitleStart')}<span className="text-accent">{t('headerTitleAccent')}</span>
          </h1>
          <p className="text-md md:text-lg text-muted-foreground mt-2">{t('headerSubtitle')}</p>
        </header>

        <div className="w-full max-w-4xl space-y-6">
          <Card className="shadow-xl overflow-hidden bg-card">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary">{t('typingChallengeCardTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <SampleTextDisplay formattedText={formattedSampleText} fontSize={fontSize} />
                <TypingInputArea
                  value={typedText}
                  onChange={localHandleInputChange}
                  disabled={!!isTestFinished || useOnScreenKeyboard}
                  readOnly={useOnScreenKeyboard}
                  inputRef={inputRef}
                  onFocus={handleInputFocus}
                  fontSize={fontSize}
                />
                {useOnScreenKeyboard && (
                  <OnScreenKeyboard 
                    onChar={handleOSKChar}
                    onBackspace={handleOSKBackspace}
                    onSpace={handleOSKSpace}
                  />
                )}
            </CardContent>
          </Card>
          
          <StatsDisplay stats={stats} />

          <Controls
            onStart={startTest}
            onReset={resetTest}
            sessionActive={sessionActive}
            soundEnabled={soundEnabled}
            onSoundToggle={handleSoundToggle}
            stats={stats}
            keystrokeHistory={keystrokeHistory}
            errors={errors}
            sampleText={sampleText}
            isFinished={!!isTestFinished}
            onOpenSettings={() => setIsSettingsDialogOpen(true)}
          />
          
          {showErrorAnalysis && (isTestFinished || (errors.length > 0 && !sessionActive && stats.timeElapsed > 0)) && (
            <ErrorAnalysisDisplay errors={errors} stats={stats} isFinished={!!isTestFinished} />
          )}

          {showKeystrokeHistory && (isTestFinished || (keystrokeHistory.length > 0 && !sessionActive && stats.timeElapsed > 0)) && (
            <KeystrokeHistoryDisplay history={keystrokeHistory} isFinished={!!isTestFinished} />
          )}
          
        </div>
        <footer className="mt-12 text-center text-sm text-muted-foreground py-4">
            <p>{t('footerText', { year: new Date().getFullYear() })}</p>
        </footer>
      </main>
      <SettingsDialog
        isOpen={isSettingsDialogOpen}
        onClose={() => setIsSettingsDialogOpen(false)}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        currentFontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        showErrorAnalysis={showErrorAnalysis}
        onShowErrorAnalysisChange={handleShowErrorAnalysisChange}
        showKeystrokeHistory={showKeystrokeHistory}
        onShowKeystrokeHistoryChange={handleShowKeystrokeHistoryChange}
        useOnScreenKeyboard={useOnScreenKeyboard}
        onUseOnScreenKeyboardChange={handleUseOnScreenKeyboardChange}
      />
    </>
  );
}
