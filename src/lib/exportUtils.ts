
import type { TypingStats, Keystroke, ErrorRecord } from '@/hooks/use-typing-test';

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
  sampleText: string
): void {
  const generalStats = [{
    WPM: stats.wpm,
    CPM: stats.cpm,
    WPS: stats.wps,
    Accuracy: `${stats.accuracy}%`,
    TimeElapsedSeconds: stats.timeElapsed,
    SampleText: sampleText.replace(/,/g, ';'), // Avoid comma in sample text for CSV
  }];

  const keystrokesCSV = convertToCSV(keystrokeHistory.map(k => ({ ...k, timestamp: new Date(k.timestamp).toISOString() })));
  const errorsCSV = convertToCSV(errors);
  const generalStatsCSV = convertToCSV(generalStats);

  const csvContent = `General Stats\n${generalStatsCSV}\n\nKeystroke History\n${keystrokesCSV}\n\nErrors\n${errorsCSV}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s8;' });
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
