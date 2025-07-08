
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ShieldAlert, Loader2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { CodeBlock } from './code-block';
import { cn } from '@/lib/utils';

// Parses the score from a raw text report, handling multiple phrasings.
const parseScore = (reportText: string): number | null => {
    if (!reportText) return null;
    const scoreRegex = /(?:Reputation Score|Final Reputation Score|Overall Reputation Score):\s*(\d{1,2})\/10/i;
    const match = reportText.match(scoreRegex);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
};

// Determines the color class based on the reputation score.
const getScoreColor = (score: number | null): string => {
    if (score === null) return '';
    if (score < 5) return 'text-destructive'; // Red for scores < 5
    if (score <= 7) return 'text-warning';   // Yellow for scores 5-7
    return 'text-success';                   // Green for scores > 7
};

const FormattedReport = ({ rawText, scoreColorClass }: { rawText: string, scoreColorClass: string }) => {
    const scoreRegex = /(?:Reputation Score|Final Reputation Score|Overall Reputation Score):\s*(\d{1,2})\/10/i;

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-2">
            {rawText.split('\n').map((line, index) => {
                if (!line.trim()) return null;
                
                const isScoreLine = scoreRegex.test(line);
                const parts = line.split(/(\*\*.*?\*\*)/g);
                
                return (
                    <p key={index} className={cn(isScoreLine && scoreColorClass, isScoreLine && 'font-bold')}>
                        {parts.map((part, partIndex) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex}>{part.substring(2, part.length - 2)}</strong>;
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

export function ReputationChecker({ tokenName }: { tokenName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [score, setScore] = useState<number | null>(null);
    const [error, setError] = useState<{ type: string, message: string } | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useLanguage();
    const { toast } = useToast();

    // Automatically fetch the reputation when the component loads or tokenName changes.
    const checkReputation = async () => {
        if (!tokenName) return;
        setIsLoading(true);
        setError(null);
        setReport(null);
        setScore(null);

        try {
            const response = await fetch('/api/reputation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenName })
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    throw new Error(`Server returned an error. Status: ${response.status}`);
                }
                throw { 
                    type: errorData.error || 'FETCH_FAILED',
                    message: errorData.message || 'An unknown server error occurred.'
                };
            }

            const result = await response.json();
            setReport(result.report);
            setScore(parseScore(result.report));

        } catch (err: any) {
            console.error("Error fetching reputation:", err);
            setError({
                type: err.type || 'FETCH_FAILED',
                message: err.message || t('ReputationChecker.errorFetch')
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if(isOpen && !report && !isLoading && !error) {
            checkReputation();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
    
    // Renders the specific UI for different error types.
    const renderErrorContent = () => {
        if (!error) return null;

        if (error.type === 'GOOGLE_API_KEY_MISSING') {
            return (
                 <div className="w-full text-left space-y-4">
                     <h3 className="font-semibold text-destructive">{t('ApiErrorCard.configErrorTitle')}</h3>
                     <p className="text-sm text-muted-foreground">{error.message}</p>
                     <div>
                        <p className="text-sm font-semibold mb-2">{t('ApiErrorCard.requiredEnvVar')}</p>
                        <CodeBlock code="GOOGLE_API_KEY=your_genkit_key_here" />
                     </div>
                     <div>
                        <p className="text-sm text-muted-foreground">{t('ApiErrorCard.fixDescription')}</p>
                        <a href="https://app.netlify.com/find/env-vars" target="_blank" rel="noopener noreferrer" className="mt-2 block">
                            <Button variant="outline" className="w-full">
                                {t('ApiErrorCard.setEnvVarButton')}
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            )
        }

        // Default error display for other issues.
        return (
            <div className="text-center text-destructive m-auto space-y-2">
                <ShieldAlert className="mx-auto h-8 w-8" />
                <p className="font-semibold">{t('ReputationChecker.errorTitle')}</p>
                <p className="text-sm">{error.message}</p>
            </div>
        );
    }

    const scoreColor = getScoreColor(score);

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className={cn("text-xl transition-colors", isLoading ? "" : scoreColor)}>
                            {t('ReputationChecker.title').replace('{tokenName}', tokenName)}
                        </CardTitle>
                        <CardDescription>{t('ReputationChecker.description')}</CardDescription>
                    </div>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        <span className="sr-only">Toggle Report</span>
                    </Button>
                </div>
            </CardHeader>
            {isOpen && (
              <>
                <CardContent className="min-h-[250px] flex flex-col items-center justify-center pt-0">
                    {isLoading && (
                        <div className="text-center text-muted-foreground m-auto space-y-2">
                            <Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" />
                            <p className="font-medium">{t('ReputationChecker.loadingTitle').replace('{tokenName}', tokenName)}</p>
                            <p className="text-sm">{t('ReputationChecker.loadingDescription')}</p>
                        </div>
                    )}
                    {!isLoading && error && renderErrorContent()}
                    {!isLoading && !error && report && (
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
                            <FormattedReport rawText={report} scoreColorClass={scoreColor} />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">
                       {t('ReputationChecker.disclaimer')}
                    </p>
                </CardFooter>
              </>
            )}
        </Card>
    );
}
