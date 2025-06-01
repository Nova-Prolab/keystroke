
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Type, Target, Timer } from 'lucide-react';
import type { TypingStats } from '@/hooks/use-typing-test';
import { useI18n } from '@/contexts/i18nContext';

interface StatsDisplayProps {
  stats: TypingStats;
}

const StatCard: React.FC<{ titleKey: string; value: string | number; icon: React.ElementType }> = ({ titleKey, value, icon: Icon }) => {
  const { t } = useI18n();
  return (
    <Card className="flex-1 min-w-[120px] shadow-sm hover:shadow-md transition-shadow bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t(titleKey)}</CardTitle>
        <Icon className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
      </CardContent>
    </Card>
  );
};

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard titleKey="stats.wpm" value={stats.wpm} icon={Gauge} />
      <StatCard titleKey="stats.cpm" value={stats.cpm} icon={Type} />
      <StatCard titleKey="stats.accuracy" value={`${stats.accuracy}%`} icon={Target} />
      <StatCard titleKey="stats.time" value={`${stats.timeElapsed}s`} icon={Timer} />
    </div>
  );
};

export default StatsDisplay;
