
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ErrorRecord, TypingStats } from '@/hooks/use-typing-test';
import {
  ShieldAlert, ListX, TrendingUp, TrendingDown, Minus, Target as TargetIcon, CheckCircle, AlertCircle,
  Gauge, Type, Timer, ListChecks, FileText, BarChartHorizontalBig, PieChartIcon, ShieldX
} from 'lucide-react';
import { useI18n } from '@/contexts/i18nContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ErrorAnalysisDisplayProps {
  errors: ErrorRecord[];
  stats: TypingStats;
  isFinished: boolean;
  sampleText: string;
}

// Define average values for comparison
const AVERAGE_WPM = 40;
const AVERAGE_CPM = 200;

const StatPill: React.FC<{ icon: React.ElementType; labelKey: string; value: string | number; unitKey?: string; iconColor?: string }> = ({ icon: Icon, labelKey, value, unitKey, iconColor = "text-accent" }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary/50 shadow">
      <div className="flex items-center text-muted-foreground">
        <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
        <span className="text-sm font-medium">{t(labelKey)}</span>
      </div>
      <p className="text-2xl font-bold text-primary mt-1">
        {value}
        {unitKey && <span className="text-xs font-normal text-muted-foreground ml-1">{t(unitKey)}</span>}
      </p>
    </div>
  );
};


const ErrorAnalysisDisplay: React.FC<ErrorAnalysisDisplayProps> = ({ errors, stats, isFinished, sampleText }) => {
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
  }, [] as Array<{ name: string, count: number }>).sort((a, b) => b.count - a.count).slice(0, 5);

  const wpmDifference = stats.wpm - AVERAGE_WPM;
  const cpmDifference = stats.cpm - AVERAGE_CPM;

  let wpmComparisonKey: string;
  let wpmBadgeVariant: "default" | "destructive" | "secondary" = "secondary";
  let WpmIcon = Minus;
  if (wpmDifference > 5) { // Consider a threshold for "higher"
    wpmComparisonKey = 'errorAnalysis.comparison.higher';
    wpmBadgeVariant = "default";
    WpmIcon = TrendingUp;
  } else if (wpmDifference < -5) { // Consider a threshold for "lower"
    wpmComparisonKey = 'errorAnalysis.comparison.lower';
    wpmBadgeVariant = "destructive";
    WpmIcon = TrendingDown;
  } else {
    wpmComparisonKey = 'errorAnalysis.comparison.onPar';
  }

  let cpmComparisonKey: string;
  let cpmBadgeVariant: "default" | "destructive" | "secondary" = "secondary";
  let CpmIcon = Minus;
  if (cpmDifference > 10) { // Consider a threshold for "higher"
    cpmComparisonKey = 'errorAnalysis.comparison.higher';
    cpmBadgeVariant = "default";
    CpmIcon = TrendingUp;
  } else if (cpmDifference < -10) { // Consider a threshold for "lower"
    cpmComparisonKey = 'errorAnalysis.comparison.lower';
    cpmBadgeVariant = "destructive";
    CpmIcon = TrendingDown;
  } else {
    cpmComparisonKey = 'errorAnalysis.comparison.onPar';
  }

  const errorCount = errors.length;
  const totalSampleCharacters = sampleText.length;
  // Calculate correct characters based on CPM and time, as CPM is based on correct entries.
  // This is more reliable than sampleLength - errors if the test was ended early or accuracy is complex.
  const correctCharacters = Math.round(stats.cpm * (stats.timeElapsed / 60));


  return (
    <Card className="mt-6 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold text-primary">
          <ShieldAlert className="mr-2 h-7 w-7 text-accent" /> {t('errorAnalysis.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">

        {/* Section 1: Key Metrics */}
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.keyMetricsTitle')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatPill icon={Gauge} labelKey="stats.wpm" value={stats.wpm} />
            <StatPill icon={Type} labelKey="stats.cpm" value={stats.cpm} />
            <StatPill icon={TargetIcon} labelKey="stats.accuracy" value={`${stats.accuracy}%`} />
            <StatPill icon={Timer} labelKey="stats.time" value={stats.timeElapsed} unitKey="errorAnalysis.secondsUnit" />
            <StatPill icon={ShieldX} labelKey="errorAnalysis.errorCount" value={errorCount} iconColor="text-destructive" />
            <StatPill icon={CheckCircle} labelKey="errorAnalysis.correctCharacters" value={correctCharacters} iconColor="text-green-600" />
            <StatPill icon={FileText} labelKey="errorAnalysis.totalSampleCharacters" value={totalSampleCharacters} />
          </div>
        </section>

        <Separator />

        {/* Section 2: Performance Comparison (WPM/CPM vs Average) */}
        {isFinished && (
          <section>
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <BarChartHorizontalBig className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.performanceComparisonTitle')}
            </h3>
            <div className="p-4 border rounded-lg bg-secondary/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <WpmIcon className={`mr-2 h-5 w-5 ${wpmDifference > 0 ? 'text-green-500' : wpmDifference < 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="text-md font-medium">{t('errorAnalysis.wpmComparison.yourWpm', { wpm: stats.wpm })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wpmBadgeVariant} className="text-xs whitespace-nowrap">
                    {Math.abs(wpmDifference) > 0 ? t(wpmComparisonKey, { diff: Math.abs(wpmDifference) }) : t(wpmComparisonKey)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({t('errorAnalysis.wpmComparison.averageIsWPM', { avg: AVERAGE_WPM })})
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CpmIcon className={`mr-2 h-5 w-5 ${cpmDifference > 0 ? 'text-green-500' : cpmDifference < 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="text-md font-medium">{t('errorAnalysis.cpmComparison.yourCpm', { cpm: stats.cpm })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cpmBadgeVariant} className="text-xs whitespace-nowrap">
                     {Math.abs(cpmDifference) > 0 ? t(cpmComparisonKey, { diff: Math.abs(cpmDifference) }) : t(cpmComparisonKey)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({t('errorAnalysis.cpmComparison.averageIsCPM', { avg: AVERAGE_CPM })})
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section 3: Detailed Errors List */}
        {errors.length > 0 ? (
          <>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <ListX className="mr-2 h-6 w-6 text-destructive" /> {t('errorAnalysis.specificErrorsTitle')}
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
            </section>
          </>
        ) : isFinished && (
          <>
            <Separator />
            <div className="flex flex-col items-center justify-center text-center p-6 border rounded-lg bg-green-500/10">
              <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
              <p className="text-lg font-semibold text-green-700">{t('errorAnalysis.noErrors')}</p>
            </div>
          </>
        )}

        {/* Section 4: Most Frequent Errors Chart */}
        {frequentErrorsData.length > 0 && errors.length > 0 && (
          <>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <PieChartIcon className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.mostFrequentErrors')}
              </h3>
              <div className="p-4 border rounded-lg">
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
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorAnalysisDisplay;
