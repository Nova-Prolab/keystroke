
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Keystroke } from '@/hooks/use-typing-test';
import { History } from 'lucide-react';

interface KeystrokeHistoryDisplayProps {
  history: Keystroke[];
  isFinished: boolean;
}

const KeystrokeHistoryDisplay: React.FC<KeystrokeHistoryDisplayProps> = ({ history, isFinished }) => {
  if (!isFinished && history.length === 0) {
    return (
       <Card className="mt-6 shadow-sm bg-card">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-primary">
             <History className="mr-2 h-6 w-6 text-accent" /> Keystroke Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Complete a typing session to see the keystroke log.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-6 shadow-lg bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-primary">
           <History className="mr-2 h-6 w-6 text-accent" /> Keystroke Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
        <ScrollArea className="h-64 w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expected</TableHead>
                <TableHead>Typed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((k, index) => (
                <TableRow key={index} className={k.status === 'incorrect' ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-muted/50'}>
                  <TableCell className="font-mono">{k.char === ' ' ? "'space'" : k.char}</TableCell>
                  <TableCell className="font-mono">{k.inputChar === ' ' ? "'space'" : k.inputChar}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      k.status === 'correct' ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 
                      k.status === 'incorrect' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' // for 'corrected' status if added
                    }`}>
                      {k.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(k.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        ) : (
          <p className="text-muted-foreground">No keystrokes recorded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default KeystrokeHistoryDisplay;
