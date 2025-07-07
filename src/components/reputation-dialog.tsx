
'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import { ReputationAlert } from './reputation-alert';
import type { Cryptocurrency } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { useState } from 'react';
import { getReputationReport, ReputationOutput } from "@/ai/flows/reputation-flow";

interface ReputationDialogProps {
  token: Cryptocurrency;
}

export function ReputationDialog({ token }: ReputationDialogProps) {
    const { t, language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [report, setReport] = useState<ReputationOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && !report) { // Fetch only if opening and no report exists yet
            setIsLoading(true);
            setError(null);
            try {
                const result = await getReputationReport({
                    tokenName: token.name,
                    tokenSymbol: token.symbol,
                    language,
                });
                setReport(result);
            } catch (e: any) {
                console.error("Reputation check failed:", e);
                setError(t('ReputationAlert.reputationCheckFailed'));
            } finally {
                setIsLoading(false);
            }
        }
        if (!open) { // Reset on close
            setReport(null);
            setError(null);
            setIsLoading(false);
        }
    };
    
    if (!token) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="sr-only">Check Reputation for {token.name}</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('ReputationAlert.dialogTitle').replace('{tokenName}', token.name)}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('ReputationAlert.dialogDescription')}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4">
                    <ReputationAlert 
                        isLoading={isLoading}
                        report={report}
                        error={error}
                        tokenName={token.name}
                        tokenSymbol={token.symbol}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('SwapInterface.cancel')}</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
