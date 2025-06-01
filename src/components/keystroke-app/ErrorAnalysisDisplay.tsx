
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ErrorRecord, TypingStats } from '@/hooks/use-typing-test';
import { ShieldAlert, ListX } from 'lucide-react';
import { useI18n } from '@/contexts/i18nContext';

interface ErrorAnalysisDisplayProps {
  errors: ErrorRecord[];
  stats: TypingStats;
  isFinished: boolean;
}

const ErrorAnalysisDisplay: React.FC<ErrorAnalysisDisplayProps> = ({ errors, stats, isFinished }) => {
  const { t } = useI18n();

  if (!isFinished && errors.length === 0) {
    return (
      <Card className="mt-6 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-primary">
            <ShieldAlert className="mr-2 h-6 w-6 text-accent" /> {t('errorAnalysis.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('errorAnalysis.completeSessionPrompt')}</p>
        </CardContent>
      </Card>
    );
  }

  const frequentErrorsData = errors.reduce((acc, error) => {
    const expectedText = error.expected === ' ' ? t('errorAnalysis.spaceChar') : `'${error.expected}'`;
    const actualText = error.actual === ' ' ? t('errorAnalysis.spaceChar') : `'${error.actual}'`;
    const key = `${t('keystrokeLog.expectedHeader')}: ${expectedText}, ${t('keystrokeLog.typedHeader')}: ${actualText}`;
    
    const existing = acc.find(item => item.name === key);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: key, count: 1 });
    }
    return acc;
  }, [] as Array<{name: string, count: number}>).sort((a,b) => b.count - a.count).slice(0, 5);

  return (
    <Card className="mt-6 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-primary">
          <ShieldAlert className="mr-2 h-6 w-6 text-accent" /> {t('errorAnalysis.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-md">
          {t('errorAnalysis.overallAccuracyPrefix')}
          <span className="font-bold text-accent">{stats.accuracy}</span>
          {t('errorAnalysis.overallAccuracySuffix')}
        </p>
        {errors.length > 0 ? (
          <>
            <h3 className="text-md font-semibold mb-2 text-primary flex items-center">
              <ListX className="mr-2 h-5 w-5 text-destructive" /> {t('errorAnalysis.specificErrorsTitle')}
            </h3>
            <ScrollArea className="h-40 w-full rounded-md border p-2 bg-secondary/30">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive-foreground bg-destructive/80 p-1.5 rounded-sm font-mono">
                    {t('errorAnalysis.errorEntryPart1', { index: error.index })}
                    <span className="font-bold">{error.expected === ' ' ? t('errorAnalysis.spaceChar') : `'${error.expected}'`}</span>
                    {t('errorAnalysis.errorEntryPart2')}
                    <span className="font-bold">{error.actual === ' ' ? t('errorAnalysis.spaceChar') : `'${error.actual}'`}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            {frequentErrorsData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-semibold mb-2 text-primary">{t('errorAnalysis.mostFrequentErrors')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frequentErrorsData} margin={{ top: 5, right: 0, left: 0, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100} 
                      interval={0}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }} 
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px' }} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" name={t('errorAnalysis.frequency')} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <p className="text-green-600 font-medium">{t('errorAnalysis.noErrors')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorAnalysisDisplay;
