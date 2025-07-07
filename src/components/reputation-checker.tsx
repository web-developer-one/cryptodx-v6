
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, ShieldAlert, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { CodeBlock } from './code-block';

// Component to render the report text, parsing basic markdown for bolding.
const FormattedReport = ({ rawText }: { rawText: string }) => {
    // Splits the text by the bold markers (e.g., **text**) and reassembles it with <strong> tags.
    const parts = rawText.split(/(\*\*.*?\*\*)/g);
    
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-2">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
                }
                // Render text, preserving line breaks.
                return part.split('\n').map((line, lineIndex) => (
                    <React.Fragment key={`${index}-${lineIndex}`}>
                        {line}
                        {lineIndex < part.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ));
            })}
        </div>
    );
};

export function ReputationChecker({ tokenName }: { tokenName: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<{ type: string, message: string } | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useLanguage();
    const { toast } = useToast();

    // Automatically fetch the reputation when the component loads or tokenName changes.
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

                // This is the critical part: check if the response is OK *before* parsing.
                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (e) {
                         // The response was not JSON (e.g., an HTML error page from the server).
                        throw new Error(`Server returned an error. Status: ${response.status}`);
                    }
                    // Throw an error with the structured message from our API.
                    throw { 
                        type: errorData.error || 'FETCH_FAILED',
                        message: errorData.message || 'An unknown server error occurred.'
                    };
                }

                const result = await response.json();
                setReport(result.report);

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

        checkReputation();
    }, [tokenName, t]); // Dependency array ensures this runs when the token name changes.

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
                        <FormattedReport rawText={report} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
