
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Play, RefreshCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TypingStats, Keystroke, ErrorRecord } from '@/hooks/use-typing-test';
import { exportTypingDataToCSV } from '@/lib/exportUtils';
import { useI18n } from '@/contexts/i18nContext';

interface ControlsProps {
  onStart: () => void;
  onReset: () => void;
  sessionActive: boolean;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  stats: TypingStats;
  keystrokeHistory: Keystroke[];
  errors: ErrorRecord[];
  sampleText: string;
  isFinished: boolean;
  onOpenSettings: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  onStart, 
  onReset, 
  sessionActive,
  soundEnabled,
  onSoundToggle,
  stats,
  keystrokeHistory,
  errors,
  sampleText,
  isFinished,
  onOpenSettings
}) => {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleExport = () => {
    if (keystrokeHistory.length === 0 && errors.length === 0 && stats.wpm === 0) {
      toast({
        title: t('controls.noDataToExportTitle'),
        description: t('controls.noDataToExportDesc'),
        variant: "destructive",
      });
      return;
    }
    try {
      exportTypingDataToCSV(stats, keystrokeHistory, errors, sampleText, t);
      toast({
        title: t('controls.exportSuccessfulTitle'),
        description: t('controls.exportSuccessfulDesc'),
      });
    } catch (error) {
      toast({
        title: t('controls.exportFailedTitle'),
        description: t('controls.exportFailedDesc'),
        variant: "destructive",
      });
      console.error("Export failed:", error);
    }
  };

  return (
    <Card className="shadow-lg bg-card">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {!sessionActive && !isFinished && (
            <Button onClick={onStart} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="mr-2 h-5 w-5" /> {t('controls.startTest')}
            </Button>
          )}
          {(sessionActive || isFinished) && (
            <Button onClick={onReset} variant="outline">
              <RefreshCcw className="mr-2 h-5 w-5" /> {t('controls.reset')}
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="sound-toggle" 
            checked={soundEnabled} 
            onCheckedChange={onSoundToggle}
            aria-label={t('controls.sound')}
          />
          <Label htmlFor="sound-toggle" className="flex items-center cursor-pointer text-sm">
            {soundEnabled ? <Volume2 className="mr-2 h-5 w-5 text-accent" /> : <VolumeX className="mr-2 h-5 w-5 text-muted-foreground" />}
            {t('controls.sound')}
          </Label>
        </div>

        <Button onClick={handleExport} variant="secondary">
          <Download className="mr-2 h-5 w-5" /> {t('controls.exportCsv')}
        </Button>

        <Button onClick={onOpenSettings} variant="outline" size="icon" aria-label={t('controls.settings')}>
          <Settings className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default Controls;
