
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ShieldAlert, Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

// This component safely renders markdown-like text from the AI
const FormattedReport = ({ rawText }: { rawText: string }) => {
    // Split by newlines to create paragraphs/breaks
    const paragraphs = rawText.split(/(\r\n|\n|\r)/);
  
    const formatLine = (line: string) => {
      // Split line by bold markers (e.g., **text**), keeping the markers
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // It's a bold part
          return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        return part; // It's a regular text part
      });
    };
  
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
        {paragraphs.map((p, i) => (
          // Render non-empty lines, treating them as paragraphs
          p.trim() ? <p key={i}>{formatLine(p)}</p> : null
        ))}
      </div>
    );
};

export function ReputationChecker({ tokenName }: { tokenName: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useLanguage();
    const { toast } = useToast();

    useEffect(() => {
        const checkReputation = async () => {
            if (!tokenName) return;
            setIsLoading(true);
            setError(null);
            setReport(null);

            try {
                const response = await fetch('/api/reputation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tokenName })
                });

                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || "An unknown error occurred.");
                }

                setReport(result.report);

            } catch (err: any) {
                console.error("Error fetching reputation:", err);
                setError(t('ReputationChecker.errorFetch'));
            } finally {
                setIsLoading(false);
            }
        };

        checkReputation();
    }, [tokenName, t]);


    const handleCopyToClipboard = () => {
        if (report) {
            navigator.clipboard.writeText(report).then(() => {
                setIsCopied(true);
                toast({ title: t('ReputationChecker.copied') });
                setTimeout(() => setIsCopied(false), 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to copy report.' });
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{t('ReputationChecker.title').replace('{tokenName}', tokenName)}</CardTitle>
                <CardDescription>{t('ReputationChecker.description')}</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[250px] flex flex-col items-center justify-center">
                {isLoading && (
                    <div className="text-center text-muted-foreground m-auto space-y-2">
                        <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" />
                        <p className="font-medium">{t('ReputationChecker.loadingTitle').replace('{tokenName}', tokenName)}</p>
                        <p className="text-sm">{t('ReputationChecker.loadingDescription')}</p>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="text-center text-destructive m-auto space-y-2">
                        <ShieldAlert className="mx-auto h-8 w-8" />
                        <p className="font-semibold">{t('ReputationChecker.errorTitle')}</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {report && !isLoading && (
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{t('ReputationChecker.reportTitle')}</h3>
                            <Button
                                onClick={handleCopyToClipboard}
                                variant="ghost"
                                size="sm"
                            >
                                {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                {isCopied ? t('ReputationChecker.copied') : t('ReputationChecker.copy')}
                            </Button>
                        </div>
                        <FormattedReport rawText={report} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
