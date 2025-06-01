
import type { TypingStats, Keystroke, ErrorRecord } from '@/hooks/use-typing-test';
import html2canvas from 'html2canvas';
import type { Theme, FontSize } from '@/app/page';

type TFunction = (key: string, params?: Record<string, string | number | boolean>) => string;

interface TestConfig {
  locale: string;
  theme: Theme;
  fontSize: FontSize;
  useOnScreenKeyboard: boolean;
}

function convertToCSV(data: any[], t: TFunction, sectionKey?: string): string {
  if (data.length === 0 && !sectionKey) return ""; // For sections like sample text, we might still want the header
  
  let csvString = "";
  if (sectionKey) {
    csvString += `${t(sectionKey)}\n`;
  }

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    csvString += headers.join(',') + '\n';
    csvString += data.map(row =>
      headers.map(header => JSON.stringify(row[header] === undefined || row[header] === null ? "" : row[header])).join(',')
    ).join('\n');
  } else if (sectionKey) {
     csvString += t('csvHeaders.noDataAvailable') + '\n';
  }
  return csvString;
}

export function exportTypingDataToCSV(
  stats: TypingStats,
  keystrokeHistory: Keystroke[],
  errors: ErrorRecord[],
  sampleText: string,
  typedText: string,
  config: TestConfig,
  t: TFunction
): void {
  const reportGeneratedOn = new Date().toLocaleString(t('localeForDate'));

  const configDetails = [
    { [t('csvHeaders.config.reportGeneratedOn')]: reportGeneratedOn },
    { [t('csvHeaders.config.language')]: config.locale },
    { [t('csvHeaders.config.theme')]: t(`settingsDialog.appearance.theme.${config.theme}`)},
    { [t('csvHeaders.config.fontSize')]: t(`settingsDialog.appearance.fontSize.${config.fontSize === 'base' ? 'normal' : config.fontSize}`)},
    { [t('csvHeaders.config.onScreenKeyboard')]: config.useOnScreenKeyboard ? t('csvHeaders.config.oskUsed.yes') : t('csvHeaders.config.oskUsed.no')},
  ];
  
  const sessionSummary = [{
    [t('stats.wpm')]: stats.wpm,
    [t('stats.cpm')]: stats.cpm,
    [t('stats.accuracy')]: `${stats.accuracy}%`,
    [t('errorAnalysis.errorRate')]: `${stats.errorRate}%`,
    [t('stats.time')]: `${stats.timeElapsed}s`,
    [t('errorAnalysis.errorCount')]: stats.errorCount,
    [t('errorAnalysis.wordsTyped')]: stats.wordsTyped,
    [t('errorAnalysis.charsTyped')]: stats.charsTyped,
    [t('errorAnalysis.correctCharacters')]: stats.correctChars,
    [t('errorAnalysis.totalSampleCharacters')]: sampleText.length,
  }];

  const sampleTextSection = [{ [t('csvHeaders.sampleTextFull')]: sampleText.replace(/\n/g, ' ').replace(/,/g, ';') }];
  const typedTextSection = [{ [t('csvHeaders.typedTextFull')]: typedText.replace(/\n/g, ' ').replace(/,/g, ';') }];

  const keystrokesFormatted = keystrokeHistory.map(k => ({ 
    [t('keystrokeLog.timestampHeader')]: new Date(k.timestamp).toISOString(),
    [t('keystrokeLog.expectedHeader')]: k.char,
    [t('keystrokeLog.typedHeader')]: k.inputChar,
    [t('keystrokeLog.statusHeader')]: t(`keystrokeLog.statusValues.${k.status}` as const, {defaultValue: k.status}),
  }));

  const errorsFormatted = errors.map(e => ({
    [t('csvHeaders.errors.index')]: e.index,
    [t('csvHeaders.errors.expected')]: e.expected,
    [t('csvHeaders.errors.actual')]: e.actual,
  }));

  const csvSections = [
    t('csvHeaders.reportTitle'),
    convertToCSV(configDetails, t, 'csvHeaders.config.title'),
    convertToCSV(sessionSummary, t, 'csvHeaders.sessionSummary.title'),
    convertToCSV(sampleTextSection, t, 'csvHeaders.sampleTextFullTitle'),
    convertToCSV(typedTextSection, t, 'csvHeaders.typedTextFullTitle'),
    convertToCSV(errorsFormatted, t, 'csvHeaders.errors.title'),
    convertToCSV(keystrokesFormatted, t, 'csvHeaders.keystrokeHistory.title'),
  ];
  
  const csvContent = csvSections.join('\n\n'); // Double newline for better separation between sections
  
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' }); // Added BOM for Excel compatibility
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const filename = `KeystrokeInsights_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function exportResultsAsImage(element: HTMLElement, filename: string): Promise<void> {
  // Temporarily remove scrollbars if any to get a clean capture
  const scrollArea = element.querySelector('[data-radix-scroll-area-viewport]');
  let originalOverflowY = '';
  if (scrollArea && scrollArea instanceof HTMLElement) {
    originalOverflowY = scrollArea.style.overflowY;
    scrollArea.style.overflowY = 'hidden';
  }

  const canvas = await html2canvas(element, {
    scale: 2, // Increase scale for higher quality
    backgroundColor: null, // Use element's background, or make it transparent if needed
    useCORS: true, // If you have external images/fonts
    logging: false, // Disable logging for cleaner console
    onclone: (document) => {
      // This is a good place to ensure styles are applied correctly in the cloned document if needed
      // For example, if dark mode styles are dynamically applied and not captured.
      const body = document.body;
      if (document.documentElement.classList.contains('dark')) {
          body.classList.add('dark');
      }
       // Ensure fonts are loaded for the canvas rendering
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(fontLink);
    }
  });

  // Restore scrollbar if it was changed
  if (scrollArea && scrollArea instanceof HTMLElement) {
    scrollArea.style.overflowY = originalOverflowY;
  }

  const image = canvas.toDataURL('image/png', 1.0); // Get PNG data URL, 1.0 quality
  const link = document.createElement('a');
  link.href = image;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
