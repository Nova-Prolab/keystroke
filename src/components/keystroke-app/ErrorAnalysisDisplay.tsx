
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ErrorRecord, TypingStats } from '@/hooks/use-typing-test';
import { ShieldAlert, ListX, TrendingUp, TrendingDown, Minus, TargetIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { useI18n } from '@/contexts/i18nContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ErrorAnalysisDisplayProps {
  errors: ErrorRecord[];
  stats: TypingStats;
  isFinished: boolean;
}

// Define average values for comparison (these could be dynamic in a real app)
const AVERAGE_WPM = 40;
const AVERAGE_CPM = 200;

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

  const wpmDifference = stats.wpm - AVERAGE_WPM;
  const cpmDifference = stats.cpm - AVERAGE_CPM;

  let wpmComparisonKey: string;
  let wpmBadgeVariant: "default" | "destructive" | "secondary" = "secondary";
  let WpmIcon = Minus;
  if (wpmDifference > 0) {
    wpmComparisonKey = 'errorAnalysis.comparison.higher';
    wpmBadgeVariant = "default"; // Typically green or positive
    WpmIcon = TrendingUp;
  } else if (wpmDifference < 0) {
    wpmComparisonKey = 'errorAnalysis.comparison.lower';
    wpmBadgeVariant = "destructive";
    WpmIcon = TrendingDown;
  } else {
    wpmComparisonKey = 'errorAnalysis.comparison.onPar';
  }

  let cpmComparisonKey: string;
  let cpmBadgeVariant: "default" | "destructive" | "secondary" = "secondary";
  let CpmIcon = Minus;
  if (cpmDifference > 0) {
    cpmComparisonKey = 'errorAnalysis.comparison.higher';
    cpmBadgeVariant = "default";
    CpmIcon = TrendingUp;
  } else if (cpmDifference < 0) {
    cpmComparisonKey = 'errorAnalysis.comparison.lower';
    cpmBadgeVariant = "destructive";
    CpmIcon = TrendingDown;
  } else {
    cpmComparisonKey = 'errorAnalysis.comparison.onPar';
  }


  return (
    <Card className="mt-6 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-primary">
          <ShieldAlert className="mr-2 h-7 w-7 text-accent" /> {t('errorAnalysis.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Summary Section */}
        <div className="p-4 border rounded-lg bg-secondary/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TargetIcon className="mr-2 h-5 w-5 text-primary" />
              <span className="text-md font-medium">{t('errorAnalysis.overallAccuracyTitle')}</span>
            </div>
            <span className={`text-xl font-bold ${stats.accuracy === 100 ? 'text-green-600' : stats.accuracy >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.accuracy}%
            </span>
          </div>
          <Separator />
          {isFinished && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <WpmIcon className={`mr-2 h-5 w-5 ${wpmDifference > 0 ? 'text-green-500' : wpmDifference < 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className="text-md font-medium">{t('errorAnalysis.wpmComparison.yourWpm', { wpm: stats.wpm })}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant={wpmBadgeVariant} className="text-xs">
                    {t(wpmComparisonKey, { diff: Math.abs(wpmDifference) })}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({t('errorAnalysis.averageIsWPM', { avg: AVERAGE_WPM })})
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                 <div className="flex items-center">
                    <CpmIcon className={`mr-2 h-5 w-5 ${cpmDifference > 0 ? 'text-green-500' : cpmDifference < 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                    <span className="text-md font-medium">{t('errorAnalysis.cpmComparison.yourCpm', { cpm: stats.cpm })}</span>
                </div>
                <div className="flex items-center">
                  <Badge variant={cpmBadgeVariant} className="text-xs">
                    {t(cpmComparisonKey, { diff: Math.abs(cpmDifference) })}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({t('errorAnalysis.averageIsCPM', { avg: AVERAGE_CPM })})
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {errors.length > 0 ? (
          <>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary flex items-center">
                <ListX className="mr-2 h-5 w-5 text-destructive" /> {t('errorAnalysis.specificErrorsTitle')}
              </h3>
              <ScrollArea className="h-40 w-full rounded-md border p-2 bg-background">
                <ul className="space-y-1.5">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive-foreground bg-destructive/80 p-2 rounded-md font-mono flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
                      <span>
                        {t('errorAnalysis.errorDetail', {
                          index: error.index + 1,
                          actual: error.actual === ' ' ? t('errorAnalysis.spaceChar') : `'${error.actual}'`,
                          expected: error.expected === ' ' ? t('errorAnalysis.spaceChar') : `'${error.expected}'`,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            {frequentErrorsData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3 text-primary">{t('errorAnalysis.mostFrequentErrors')}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={frequentErrorsData} margin={{ top: 5, right: 5, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      angle={-35} 
                      textAnchor="end" 
                      height={80} 
                      interval={0}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '0.5rem' }} 
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                    />
                    <Legend wrapperStyle={{ color: 'hsl(var(--foreground))', paddingTop: '10px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" name={t('errorAnalysis.frequency')} radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : isFinished && (
          <div className="flex flex-col items-center justify-center text-center p-6 border rounded-lg bg-green-500/10">
            <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
            <p className="text-lg font-semibold text-green-700">{t('errorAnalysis.noErrors')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorAnalysisDisplay;
