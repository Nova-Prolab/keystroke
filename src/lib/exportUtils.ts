
import type { TypingStats, Keystroke, ErrorRecord } from '@/hooks/use-typing-test';

// Define a type for the translation function
type TFunction = (key: string, params?: Record<string, string | number>) => string;

function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => JSON.stringify(row[header])).join(',')
    )
  ];
  return csvRows.join('\n');
}

export function exportTypingDataToCSV(
  stats: TypingStats,
  keystrokeHistory: Keystroke[],
  errors: ErrorRecord[],
  sampleText: string,
  t: TFunction // Pass the translation function
): void {
  const reportGeneratedOn = new Date().toLocaleString(t('localeForDate', {locale: 'en-US'})); // Use translated locale string for date formatting consistency if needed

  const generalStats = [{
    [t('csvHeaders.reportGeneratedOn')]: reportGeneratedOn,
    [t('csvHeaders.wpm')]: stats.wpm,
    [t('csvHeaders.cpm')]: stats.cpm,
    [t('csvHeaders.wps')]: stats.wps,
    [t('csvHeaders.accuracy')]: `${stats.accuracy}%`,
    [t('csvHeaders.timeElapsed')]: stats.timeElapsed,
    [t('csvHeaders.sampleText')]: sampleText.replace(/,/g, ';'), 
  }];

  const keystrokesFormatted = keystrokeHistory.map(k => ({ 
    [t('csvHeaders.char')]: k.char,
    [t('csvHeaders.inputChar')]: k.inputChar,
    [t('csvHeaders.status')]: t(`keystrokeLog.statusValues.${k.status}` as const, k.status),
    [t('csvHeaders.timestamp')]: new Date(k.timestamp).toISOString() 
  }));

  const errorsFormatted = errors.map(e => ({
    [t('csvHeaders.expected')]: e.expected,
    [t('csvHeaders.actual')]: e.actual,
    [t('csvHeaders.index')]: e.index,
  }));

  const keystrokesCSV = convertToCSV(keystrokesFormatted);
  const errorsCSV = convertToCSV(errorsFormatted);
  const generalStatsCSV = convertToCSV(generalStats);

  const csvContent = 
`${t('csvHeaders.generalStats')}\n${generalStatsCSV}\n
${t('csvHeaders.keystrokeHistory')}\n${keystrokesCSV}\n
${t('csvHeaders.errors')}\n${errorsCSV}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); // Changed to utf-8 for better compatibility
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'keystroke_insights_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

