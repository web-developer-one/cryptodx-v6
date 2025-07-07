'use client';

import { ReputationOutput } from "@/ai/flows/reputation-flow";
import { useLanguage } from "@/hooks/use-language";
import { AlertCircle, CheckCircle, ShieldAlert, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "./ui/skeleton";


interface ReputationAlertProps {
    report: ReputationOutput | null;
    error: string | null;
    isLoading: boolean;
    tokenName: string;
    tokenSymbol: string;
}

export function ReputationAlert({ report, error, isLoading, tokenName, tokenSymbol }: ReputationAlertProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  if (error || !report) {
    return (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <div>
                    <CardTitle className="text-destructive">{t('ReputationAlert.reputationCheckFailed')}</CardTitle>
                    <CardDescription className="text-destructive/80">{error || "An unknown error occurred."}</CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  const { status, summary, findings } = report;

  if (status === 'clear') {
     return (
        <Card className="border-green-500/50 bg-green-500/10">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                    <CardTitle className="text-green-800 dark:text-green-300">{t('ReputationAlert.clear')}</CardTitle>
                    <CardDescription>{summary}</CardDescription>
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
        <CardHeader>
            <div className="flex items-center gap-4">
                <ShieldAlert className="h-8 w-8 text-destructive flex-shrink-0" />
                <div>
                    <CardTitle className="text-destructive">
                        {t('ReputationAlert.alertTitle').replace('{tokenName}', tokenName).replace('{tokenSymbol}', tokenSymbol)}
                    </CardTitle>
                    <CardDescription className="text-destructive/80">{summary}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {findings && findings.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                    {findings.filter(f => f && f.title).map((finding, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-destructive/20">
                            <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between items-center w-full pr-4 text-left">
                                <span className="font-semibold">{finding!.title}</span>
                                {finding!.severity && <Badge variant={getSeverityBadgeVariant(finding!.severity)} className="capitalize ml-2">{finding!.severity}</Badge>}
                            </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-3">
                            {finding!.description && <p>{finding!.description}</p>}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                {finding!.source ? <span><strong>{t('ReputationAlert.source')}:</strong> {finding!.source}</span> : <span/>}
                                {finding!.sourceUrl && (
                                    <a href={finding!.sourceUrl} target="_blank" rel="noopener noreferrer">
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
            )}
             <div className="flex items-start gap-2 text-xs text-muted-foreground mt-4 p-3 bg-secondary/30 rounded-md border">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{t('ReputationAlert.infoDisclaimer')}</p>
            </div>
        </CardContent>
    </Card>
  )
}
