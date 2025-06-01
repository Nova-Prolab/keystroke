
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ErrorRecord, TypingStats } from '@/hooks/use-typing-test';
import {
  Activity, TrendingUp, TrendingDown, Minus, Target as TargetIcon, CheckCircle, AlertCircle,
  Gauge, Type, Timer, ListChecks, FileText, BarChartHorizontalBig, PieChart as PieChartIconLucide, ShieldX, Percent, MessageSquareWarning, TextCursorInput, BarChart4
} from 'lucide-react';
import { useI18n } from '@/contexts/i18nContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ErrorAnalysisDisplayProps {
  errors: ErrorRecord[];
  stats: TypingStats;
  isFinished: boolean;
  sampleText: string;
  typedText: string;
  analysisCardRef?: React.RefObject<HTMLDivElement>; // For html2canvas
}

// Define average values for comparison
const AVERAGE_WPM = 40;
const AVERAGE_CPM = 200; // WPM * 5

const StatPill: React.FC<{ icon: React.ElementType; labelKey: string; value: string | number; unitKey?: string; iconColor?: string; descriptionKey?: string }> = ({ icon: Icon, labelKey, value, unitKey, iconColor = "text-accent", descriptionKey }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-card shadow-md border border-border transition-all hover:shadow-lg">
      <div className="flex items-center text-muted-foreground mb-1">
        <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
        <span className="text-sm font-medium">{t(labelKey)}</span>
      </div>
      <p className="text-2xl font-bold text-primary">
        {value}
        {unitKey && <span className="text-xs font-normal text-muted-foreground ml-1">{t(unitKey)}</span>}
      </p>
      {descriptionKey && <p className="text-xs text-muted-foreground mt-0.5 text-center">{t(descriptionKey)}</p>}
    </div>
  );
};


const ErrorAnalysisDisplay: React.FC<ErrorAnalysisDisplayProps> = ({ errors, stats, isFinished, sampleText, typedText, analysisCardRef }) => {
  const { t } = useI18n();

  if (!isFinished && errors.length === 0 && stats.timeElapsed === 0) {
    return (
      <Card className="mt-6 shadow-sm bg-card border">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-primary">
            <Activity className="mr-2 h-6 w-6 text-accent" /> {t('errorAnalysis.title')}
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
  let wpmBadgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
  let WpmIcon = Minus;
  if (wpmDifference > 5) { 
    wpmComparisonKey = 'errorAnalysis.comparison.higher';
    wpmBadgeVariant = "default"; // Greenish in default theme
    WpmIcon = TrendingUp;
  } else if (wpmDifference < -5) { 
    wpmComparisonKey = 'errorAnalysis.comparison.lower';
    wpmBadgeVariant = "destructive";
    WpmIcon = TrendingDown;
  } else {
    wpmComparisonKey = 'errorAnalysis.comparison.onPar';
    wpmBadgeVariant = "outline";
  }

  let cpmComparisonKey: string;
  let cpmBadgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
  let CpmIcon = Minus;
  if (cpmDifference > 25) { // CPM difference threshold can be larger
    cpmComparisonKey = 'errorAnalysis.comparison.higher';
    cpmBadgeVariant = "default";
    CpmIcon = TrendingUp;
  } else if (cpmDifference < -25) {
    cpmComparisonKey = 'errorAnalysis.comparison.lower';
    cpmBadgeVariant = "destructive";
    CpmIcon = TrendingDown;
  } else {
    cpmComparisonKey = 'errorAnalysis.comparison.onPar';
    cpmBadgeVariant = "outline";
  }

  const accuracyData = [
    { name: 'Correct', value: stats.accuracy, fill: 'hsl(var(--chart-2))' }, // Accent color (e.g. Electric Blue)
    { name: 'Incorrect', value: 100 - stats.accuracy, fill: 'hsl(var(--destructive))' }, // Destructive color
  ];

  return (
    <Card ref={analysisCardRef} className="mt-6 shadow-xl bg-card border-2 border-primary/20 rounded-xl overflow-hidden">
      <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
        <CardTitle className="flex items-center text-2xl font-bold text-primary">
          <Activity className="mr-3 h-8 w-8 text-accent" /> {t('errorAnalysis.title')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{t('errorAnalysis.sessionReportSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 p-6">

        <section>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.keyMetricsTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatPill icon={Gauge} labelKey="stats.wpm" value={stats.wpm} descriptionKey="errorAnalysis.wpmDescription"/>
            <StatPill icon={Type} labelKey="stats.cpm" value={stats.cpm} descriptionKey="errorAnalysis.cpmDescription"/>
            <StatPill icon={TargetIcon} labelKey="stats.accuracy" value={`${stats.accuracy}%`} descriptionKey="errorAnalysis.accuracyDescription"/>
            <StatPill icon={Timer} labelKey="stats.time" value={stats.timeElapsed} unitKey="errorAnalysis.secondsUnit" descriptionKey="errorAnalysis.timeDescription"/>
            <StatPill icon={ShieldX} labelKey="errorAnalysis.errorCount" value={stats.errorCount} iconColor="text-destructive" descriptionKey="errorAnalysis.errorCountDescription"/>
            <StatPill icon={Percent} labelKey="errorAnalysis.errorRate" value={`${stats.errorRate}%`} iconColor="text-destructive" descriptionKey="errorAnalysis.errorRateDescription"/>
            <StatPill icon={CheckCircle} labelKey="errorAnalysis.correctCharacters" value={stats.correctChars} iconColor="text-green-600" descriptionKey="errorAnalysis.correctCharsDescription"/>
            <StatPill icon={TextCursorInput} labelKey="errorAnalysis.charsTyped" value={stats.charsTyped} descriptionKey="errorAnalysis.charsTypedDescription"/>
            <StatPill icon={BarChart4} labelKey="errorAnalysis.wordsTyped" value={stats.wordsTyped} descriptionKey="errorAnalysis.wordsTypedDescription"/>
            <StatPill icon={FileText} labelKey="errorAnalysis.totalSampleCharacters" value={sampleText.length} descriptionKey="errorAnalysis.totalSampleCharsDescription"/>
          </div>
        </section>

        <Separator />
        
        <div className="grid md:grid-cols-2 gap-6">
          {isFinished && (
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <BarChartHorizontalBig className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.performanceComparisonTitle')}
              </h3>
              <div className="p-4 border rounded-lg bg-card space-y-4 shadow">
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

          <section>
             <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <PieChartIconLucide className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.accuracyBreakdownTitle')}
              </h3>
              <div className="p-4 border rounded-lg bg-card shadow h-[160px]"> {/* Fixed height for pie chart container */}
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={accuracyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                        {accuracyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--popover-foreground))', borderRadius: '0.5rem' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
              </div>
          </section>
        </div>


        {errors.length > 0 ? (
          <>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <MessageSquareWarning className="mr-2 h-6 w-6 text-destructive" /> {t('errorAnalysis.specificErrorsTitle')}
              </h3>
              <ScrollArea className="h-40 w-full rounded-md border p-2 bg-background shadow-inner">
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
            <div className="flex flex-col items-center justify-center text-center p-6 border rounded-lg bg-green-500/10 shadow">
              <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
              <p className="text-lg font-semibold text-green-700">{t('errorAnalysis.noErrors')}</p>
              <p className="text-sm text-muted-foreground">{t('errorAnalysis.perfectScore')}</p>
            </div>
          </>
        )}

        {frequentErrorsData.length > 0 && errors.length > 0 && (
          <>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <BarChart4 className="mr-2 h-6 w-6 text-primary" /> {t('errorAnalysis.mostFrequentErrors')}
              </h3>
              <div className="p-4 border rounded-lg bg-card shadow">
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
         <CardFooter className="pt-6 text-xs text-muted-foreground text-center">
            {t('errorAnalysis.reportGeneratedHint', { date: new Date().toLocaleString(t('localeForDate')) })}
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default ErrorAnalysisDisplay;
