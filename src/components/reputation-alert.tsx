
'use client';

import { ReputationOutput } from "@/ai/flows/reputation-flow";
import { AlertCircle, CheckCircle, FileWarning, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

interface ReputationAlertProps {
    isLoading: boolean;
    report: ReputationOutput | null;
    error: string | null;
    tokenName: string;
    tokenSymbol: string;
}

const RiskIndicator = ({ riskLevel }: { riskLevel: 'Low' | 'Medium' | 'High' }) => {
    const { t } = useLanguage();
    const riskMap = {
        Low: { text: t('ReputationAlert.low'), icon: <CheckCircle className="h-5 w-5" />, color: 'text-success' },
        Medium: { text: t('ReputationAlert.medium'), icon: <FileWarning className="h-5 w-5" />, color: 'text-warning' },
        High: { text: t('ReputationAlert.high'), icon: <AlertCircle className="h-5 w-5" />, color: 'text-destructive' },
    };
    const { text, icon, color } = riskMap[riskLevel];
    return (
        <div className={cn("flex items-center gap-2 font-bold", color)}>
            {icon}
            <span>{text}</span>
        </div>
    );
};

export function ReputationAlert({ isLoading, report, error, tokenName, tokenSymbol }: ReputationAlertProps) {
    const { t } = useLanguage();
    
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center text-destructive flex flex-col items-center gap-4 py-8">
                <AlertCircle className="h-12 w-12" />
                <p className="font-semibold">{error}</p>
            </div>
        )
    }

    if (!report) {
        return null; // Should be handled by parent component's loading state
    }

    const sentimentVariant = {
        'Positive': 'default',
        'Neutral': 'secondary',
        'Negative': 'destructive',
    }[report.sentiment] || 'default';

    const sentimentText = {
        'Positive': t('ReputationAlert.positive'),
        'Neutral': t('ReputationAlert.neutral'),
        'Negative': t('ReputationAlert.negative'),
    }[report.sentiment];
    
    return (
        <div className="space-y-6 text-sm">
            <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{t('ReputationAlert.summary')}</h3>
                <p className="text-muted-foreground">{report.summary}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{t('ReputationAlert.sentiment')}</p>
                    <Badge variant={sentimentVariant} className="text-base">{sentimentText}</Badge>
                </Card>
                <Card className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{t('ReputationAlert.riskLevel')}</p>
                    <RiskIndicator riskLevel={report.riskLevel} />
                </Card>
            </div>

            <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{t('ReputationAlert.findings')}</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    {report.findings.map((finding, index) => (
                        <li key={index}>{finding}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

