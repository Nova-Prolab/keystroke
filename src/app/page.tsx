
"use client";

import type React from 'react';
import { useState, useEffect, useCallback, useRef }from 'react';
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
import { exportTypingDataToCSV, exportResultsAsImage } from '@/lib/exportUtils';

export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'base' | 'lg';

export default function KeystrokeInsightsPage() {
  const { locale, t, isInitialized: i18nReady } = useI18n();
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
    endTime,
  } = useTypingTest();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);

  // Settings State
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [showErrorAnalysis, setShowErrorAnalysis] = useState<boolean>(true);
  const [showKeystrokeHistory, setShowKeystrokeHistory] = useState<boolean>(true);
  const [useOnScreenKeyboard, setUseOnScreenKeyboard] = useState<boolean>(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);

  const analysisCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 2000); // Minimum 2 seconds for the loading screen

    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
    } catch (e) {
      console.warn("AudioContext not supported or could not be initialized.", e);
      if (i18nReady) { // Check i18nReady before toasting
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
      setTheme('light'); 
      document.documentElement.classList.toggle('dark', false);
      localStorage.setItem('theme', 'light');
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
      clearTimeout(timer);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.warn("Failed to close AudioContext:", err));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18nReady]); // Added i18nReady to re-evaluate toast if it becomes ready later

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
    if (!useOSK && inputRef.current && (sessionActive || !isTestFinished)) {
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
    handleInputChange(value);
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

  const handleOSKChar = (char: string) => {
    if (endTime || !sampleText || (typedText.length >= sampleText.length)) return; 
    if (!sessionActive && typedText.length === 0 && char.length > 0) { 
      startTest(); 
      setTimeout(() => localHandleInputChange(char), 0);
      return;
    }
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
     if (!sessionActive && typedText.length === 0) { 
      startTest();
      setTimeout(() => localHandleInputChange(' '), 0);
      return;
    }
    const newTypedText = typedText + ' ';
    localHandleInputChange(newTypedText);
  };

  const handleExportCSV = () => {
     if (stats.timeElapsed === 0 && keystrokeHistory.length === 0 && errors.length === 0) {
      toast({
        title: t('controls.noDataToExportTitle'),
        description: t('controls.noDataToExportDesc'),
        variant: "destructive",
      });
      return;
    }
    try {
      const configData = { locale, theme, fontSize, useOnScreenKeyboard };
      exportTypingDataToCSV(stats, keystrokeHistory, errors, sampleText, typedText, configData, t);
      toast({
        title: t('controls.exportSuccessfulTitle'),
        description: t('controls.exportCsvSuccessfulDesc'),
      });
    } catch (error) {
      toast({
        title: t('controls.exportFailedTitle'),
        description: t('controls.exportFailedDesc'),
        variant: "destructive",
      });
      console.error("CSV Export failed:", error);
    }
  };

  const handleShareImage = async () => {
    if (!analysisCardRef.current) {
      toast({
        title: t('controls.shareImageErrorTitle'),
        description: t('controls.shareImageErrorDescNoCard'),
        variant: "destructive",
      });
      return;
    }
    if (stats.timeElapsed === 0 && keystrokeHistory.length === 0 && errors.length === 0) {
      toast({
        title: t('controls.noDataToExportTitle'),
        description: t('controls.noDataToShareDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      await exportResultsAsImage(analysisCardRef.current, `KeystrokeInsights_Results_${new Date().toISOString().split('T')[0]}.png`);
      toast({
        title: t('controls.shareImageSuccessfulTitle'),
        description: t('controls.shareImageSuccessfulDesc'),
      });
    } catch (error) {
       toast({
        title: t('controls.shareImageErrorTitle'),
        description: t('controls.shareImageErrorDescGeneral'),
        variant: "destructive",
      });
      console.error("Image Share failed:", error);
    }
  };

  const isTestFinished = !!endTime; 
  
  // Conditions for showing the loading screen
  const isLoadingScreenVisible = !isMounted || !i18nReady || !typingTestReady || !sampleText || !minLoadingTimePassed;

  if (isLoadingScreenVisible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
        <div className="mb-8">
          <Keyboard className="h-28 w-28 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-primary mb-3">
          {i18nReady ? t('headerTitleStart') : 'Keystroke ' }
          <span className="text-accent">{i18nReady ? t('headerTitleAccent') : 'Insights'}</span>
        </h1>
        <p className="text-xl text-muted-foreground flex items-center justify-center">
          <span>{i18nReady ? t('loading.preparingChallenge') : 'Loading challenge...'}</span>
          <span className="inline-block ml-2">
            <span className="animate-ping inline-block h-2 w-2 bg-accent rounded-full"></span>
            <span className="animate-ping inline-block h-2 w-2 bg-accent rounded-full mx-1" style={{ animationDelay: '0.15s' }}></span>
            <span className="animate-ping inline-block h-2 w-2 bg-accent rounded-full" style={{ animationDelay: '0.3s' }}></span>
          </span>
        </p>
      </div>
    );
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen bg-background text-foreground">
        <header className="mb-10 text-center w-full max-w-full">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary flex items-center justify-center flex-wrap"
          >
            <Keyboard className="mr-2 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 text-accent flex-shrink-0" />
            <span className="text-center">
              {t('headerTitleStart')}
              <span className="text-accent">{t('headerTitleAccent')}</span>
            </span>
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
                  disabled={isTestFinished || (useOnScreenKeyboard && sessionActive && !isTestFinished)}
                  readOnly={useOnScreenKeyboard && !isTestFinished}
                  inputRef={inputRef}
                  onFocus={handleInputFocus}
                  fontSize={fontSize}
                />
                {useOnScreenKeyboard && !isTestFinished && (
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
            isFinished={isTestFinished}
            onOpenSettings={() => setIsSettingsDialogOpen(true)}
            onExportCSV={handleExportCSV}
            onShareImage={handleShareImage}
            canShareOrExport={isTestFinished || (stats.timeElapsed > 0 && !sessionActive)}
          />

          {showErrorAnalysis && (isTestFinished || (stats.errorCount > 0 && !sessionActive && stats.timeElapsed > 0)) && (
            <ErrorAnalysisDisplay 
              errors={errors} 
              stats={stats} 
              isFinished={isTestFinished} 
              sampleText={sampleText} 
              typedText={typedText}
              analysisCardRef={analysisCardRef}
            />
          )}

          {showKeystrokeHistory && (isTestFinished || (keystrokeHistory.length > 0 && !sessionActive && stats.timeElapsed > 0)) && (
            <KeystrokeHistoryDisplay history={keystrokeHistory} isFinished={isTestFinished} />
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

