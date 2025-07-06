'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { getReputationReport, ReputationOutput } from "@/ai/flows/reputation-flow";
import { useLanguage } from "@/hooks/use-language";
import { AlertCircle, CheckCircle, ShieldAlert, Loader2, Volume2, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


interface ReputationAlertProps {
    tokenName: string;
    tokenSymbol: string;
}

export function ReputationAlert({ tokenName, tokenSymbol }: ReputationAlertProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<ReputationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const result = await getReputationReport({
            tokenName,
            tokenSymbol,
            language: language,
            // Since user authentication is removed, disable audio feature.
            enableAudio: false
        });
        setData(result);
    } catch (e: any) {
        console.error("Reputation check failed:", e);
        setError(t('BuyInterface.reputationCheckFailed'));
    } finally {
        setIsLoading(false);
    }
  }, [tokenName, tokenSymbol, language, t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handlePlayAudio = () => {
    if (data?.audio && audioRef.current) {
        audioRef.current.src = data.audio;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }

  if (isLoading) {
    return (
        <Card className="bg-secondary/30">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <div>
                    <CardTitle>{t('ReputationAlert.checking')}</CardTitle>
                    <CardDescription>{t('ReputationAlert.checkingDescription')}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  if (error || !data) {
    return (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                    <CardTitle className="text-destructive">{t('BuyInterface.reputationCheckFailed')}</CardTitle>
                    <CardDescription>{error || "An unknown error occurred."}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  const { report, audio } = data;

  if (report.status === 'clear') {
     return (
        <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                    <CardTitle className="text-green-800 dark:text-green-300">{t('ReputationAlert.clear')}</CardTitle>
                    <CardDescription>{report.summary}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  const getSeverityBadgeVariant = (severity: 'low' | 'medium' | 'high' | null | undefined): 'default' | 'warning' | 'destructive' => {
    if (!severity) return 'default';
    switch (severity) {
        case 'low': return 'default';
        case 'medium': return 'warning';
        case 'high': return 'destructive';
        default: return 'default';
    }
  }
  
  return (
    <Card className="border-destructive bg-destructive/10">
        <audio ref={audioRef} className="hidden" />
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <ShieldAlert className="h-8 w-8 text-destructive flex-shrink-0" />
                    <div>
                        <CardTitle className="text-destructive">
                            {t('ReputationAlert.alertTitle').replace('{tokenName}', tokenName).replace('{tokenSymbol}', tokenSymbol)}
                        </CardTitle>
                        <CardDescription className="text-destructive/80">{report.summary}</CardDescription>
                    </div>
                </div>
                {audio && (
                    <Button variant="destructive" size="icon" onClick={handlePlayAudio}>
                        <Volume2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {report.findings.map((finding, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-destructive/20">
                        <AccordionTrigger className="hover:no-underline">
                           <div className="flex justify-between items-center w-full pr-4">
                                <span className="font-semibold">{finding.title}</span>
                                <Badge variant={getSeverityBadgeVariant(finding.severity)} className="capitalize">{finding.severity || 'Info'}</Badge>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3">
                           <p>{finding.description}</p>
                           <div className="flex items-center justify-between text-xs text-muted-foreground">
                                {finding.source ? <span><strong>{t('ReputationAlert.source')}:</strong> {finding.source}</span> : <span/>}
                                {finding.sourceUrl && (
                                    <a href={finding.sourceUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="link" className="h-auto p-0 text-xs text-destructive hover:text-destructive/80">
                                            {t('ReputationAlert.viewSource')} <ExternalLink className="ml-1 h-3 w-3" />
                                        </Button>
                                    </a>
                                )}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
             <div className="flex items-start gap-2 text-xs text-muted-foreground mt-4 p-3 bg-secondary/30 rounded-md border">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{t('BuyInterface.infoDisclaimer')}</p>
            </div>
        </CardContent>
    </Card>
  )
}
