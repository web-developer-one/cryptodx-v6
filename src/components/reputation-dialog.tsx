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

interface ReputationDialogProps {
  token: Cryptocurrency;
}

export function ReputationDialog({ token }: ReputationDialogProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    
    if (!token) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
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
                    {/* The key forces a re-mount and re-fetch when the dialog is opened */}
                    {isOpen && <ReputationAlert key={token.id} tokenName={token.name} tokenSymbol={token.symbol} />}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('SwapInterface.cancel')}</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
