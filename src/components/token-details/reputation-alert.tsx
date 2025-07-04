'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { checkTokenReputation, CheckTokenReputationOutput } from '@/ai/flows/check-token-reputation';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent } from '../ui/card';

export function ReputationAlert({ token }: { token: TokenDetails }) {
  const [isLoading, setIsLoading] = useState(true);
  const [reputation, setReputation] = useState<CheckTokenReputationOutput | null>(null);

  useEffect(() => {
    const getReputation = async () => {
      setIsLoading(true);
      try {
        const result = await checkTokenReputation({
          tokenName: token.name,
          tokenSymbol: token.symbol,
        });
        setReputation(result);
      } catch (error) {
        console.error("Failed to check token reputation:", error);
        // Don't show an error to the user, just fail silently.
        setReputation(null);
      } finally {
        setIsLoading(false);
      }
    };

    getReputation();
  }, [token.name, token.symbol]);

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
           <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           <div>
              <p className="font-semibold">Checking Reputation...</p>
              <p className="text-sm text-muted-foreground">Analyzing token history for known issues.</p>
           </div>
        </CardContent>
      </Card>
    )
  }

  if (!reputation) return null;

  // Show a "Verified" card if no scam is detected.
  if (!reputation.isScamOrScandal) {
      return (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="p-4 flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">Reputation Clear</p>
              <p className="text-sm text-muted-foreground">No significant negative events found in our scan.</p>
            </div>
          </CardContent>
        </Card>
      );
  }

  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <span>Reputation Alert for {token.name} ({token.symbol})</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="pt-4 text-base space-y-4">
                <p>{reputation.reasoning}</p>
                {reputation.sourceUrl && (
                    <p className="text-sm">
                        Source: <a href={reputation.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80 break-all">{reputation.sourceUrl}</a>
                    </p>
                )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Acknowledge and Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
