
"use client";

import type React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Theme, FontSize } from '@/app/page'; // Assuming types are exported from page.tsx
import { useI18n } from '@/contexts/i18nContext';
import { Separator } from '@/components/ui/separator';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentFontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  showErrorAnalysis: boolean;
  onShowErrorAnalysisChange: (show: boolean) => void;
  showKeystrokeHistory: boolean;
  onShowKeystrokeHistoryChange: (show: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  currentFontSize,
  onFontSizeChange,
  showErrorAnalysis,
  onShowErrorAnalysisChange,
  showKeystrokeHistory,
  onShowKeystrokeHistoryChange,
}) => {
  const { t } = useI18n();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-primary">{t('settingsDialog.title')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('settingsDialog.description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">{t('settingsDialog.appearance.title')}</h3>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-toggle" className="text-foreground">
                {t('settingsDialog.appearance.theme.label')} ({currentTheme === 'dark' ? t('settingsDialog.appearance.theme.dark') : t('settingsDialog.appearance.theme.light')})
              </Label>
              <Switch
                id="theme-toggle"
                checked={currentTheme === 'dark'}
                onCheckedChange={(checked) => onThemeChange(checked ? 'dark' : 'light')}
                aria-label={t('settingsDialog.appearance.theme.label')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">{t('settingsDialog.appearance.fontSize.label')}</Label>
              <RadioGroup
                value={currentFontSize}
                onValueChange={(value) => onFontSizeChange(value as FontSize)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sm" id="fs-sm" />
                  <Label htmlFor="fs-sm" className="text-foreground cursor-pointer">{t('settingsDialog.appearance.fontSize.small')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="base" id="fs-base" />
                  <Label htmlFor="fs-base" className="text-foreground cursor-pointer">{t('settingsDialog.appearance.fontSize.normal')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lg" id="fs-lg" />
                  <Label htmlFor="fs-lg" className="text-foreground cursor-pointer">{t('settingsDialog.appearance.fontSize.large')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium text-foreground">{t('settingsDialog.display.title')}</h3>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="error-analysis-toggle" className="text-foreground">
                {t('settingsDialog.display.showErrorAnalysis')}
              </Label>
              <Switch
                id="error-analysis-toggle"
                checked={showErrorAnalysis}
                onCheckedChange={onShowErrorAnalysisChange}
                aria-label={t('settingsDialog.display.showErrorAnalysis')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="keystroke-history-toggle" className="text-foreground">
                {t('settingsDialog.display.showKeystrokeHistory')}
              </Label>
              <Switch
                id="keystroke-history-toggle"
                checked={showKeystrokeHistory}
                onCheckedChange={onShowKeystrokeHistoryChange}
                aria-label={t('settingsDialog.display.showKeystrokeHistory')}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('settingsDialog.closeButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
