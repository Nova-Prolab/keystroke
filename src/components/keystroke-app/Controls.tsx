
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Download, Play, RefreshCcw, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TypingStats, Keystroke, ErrorRecord } from '@/hooks/use-typing-test';
import { exportTypingDataToCSV } from '@/lib/exportUtils';

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
  isFinished
}) => {
  const { toast } = useToast();

  const handleExport = () => {
    if (keystrokeHistory.length === 0 && errors.length === 0 && stats.wpm === 0) {
      toast({
        title: "No Data to Export",
        description: "Please complete a typing session to export data.",
        variant: "destructive",
      });
      return;
    }
    try {
      exportTypingDataToCSV(stats, keystrokeHistory, errors, sampleText);
      toast({
        title: "Export Successful",
        description: "Your typing data has been exported as a CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
      console.error("Export failed:", error);
    }
  };

  return (
    <Card className="shadow-lg bg-card">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          {!sessionActive && !isFinished && (
            <Button onClick={onStart} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="mr-2 h-5 w-5" /> Start Test
            </Button>
          )}
          {(sessionActive || isFinished) && (
            <Button onClick={onReset} variant="outline">
              <RefreshCcw className="mr-2 h-5 w-5" /> Reset
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="sound-toggle" 
            checked={soundEnabled} 
            onCheckedChange={onSoundToggle}
            aria-label="Toggle sound effects"
          />
          <Label htmlFor="sound-toggle" className="flex items-center cursor-pointer text-sm">
            {soundEnabled ? <Volume2 className="mr-2 h-5 w-5 text-accent" /> : <VolumeX className="mr-2 h-5 w-5 text-muted-foreground" />}
            Sound
          </Label>
        </div>

        <Button onClick={handleExport} variant="secondary">
          <Download className="mr-2 h-5 w-5" /> Export CSV
        </Button>
      </CardContent>
    </Card>
  );
};

export default Controls;
