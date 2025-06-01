
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Type, Target, Timer } from 'lucide-react';
import type { TypingStats } from '@/hooks/use-typing-test';

interface StatsDisplayProps {
  stats: TypingStats;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <Card className="flex-1 min-w-[120px] shadow-sm hover:shadow-md transition-shadow bg-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-accent" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-primary">{value}</div>
    </CardContent>
  </Card>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="WPM" value={stats.wpm} icon={Gauge} />
      <StatCard title="CPM" value={stats.cpm} icon={Type} />
      <StatCard title="Accuracy" value={`${stats.accuracy}%`} icon={Target} />
      <StatCard title="Time" value={`${stats.timeElapsed}s`} icon={Timer} />
    </div>
  );
};

export default StatsDisplay;
