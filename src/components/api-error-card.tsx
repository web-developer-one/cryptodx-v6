
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Button } from "./ui/button";
import { useLanguage } from "@/hooks/use-language";

interface ApiErrorCardProps {
    error: string | null;
    context: string;
}

export function ApiErrorCard({ error, context }: ApiErrorCardProps) {
    const { t } = useLanguage();

    let title = t('ApiErrorCard.errorLoading').replace('{context}', context);
    let description: React.ReactNode = `There was an issue fetching data from the API. Please try again later.`;
    let code;
    let footer;

    if (error === 'API_KEY_MISSING') {
        title = t('ApiErrorCard.configErrorTitle');
        const descText = t('ApiErrorCard.configErrorDescription');
        const descParts = descText.split(/<1>|<\/1>/);
        description = (
            <>
                {descParts[0]}
                <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{descParts[1]}</code>
                {descParts[2]}
            </>
        );
        code = `COINMARKETCAP_API_KEY=your_key_here`;

        const footerText = t('ApiErrorCard.netlifyHelpText');
        const footerParts = footerText.split(/<1\/>/);

        footer = (
            <div className="flex flex-col gap-2 w-full">
                <p className="text-sm text-muted-foreground">{t('ApiErrorCard.fixDescription')}</p>
                <a href="https://app.netlify.com/find/env-vars" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                        {t('ApiErrorCard.setEnvVarButton')}
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </a>
                 <p className="text-xs text-muted-foreground text-center mt-2">{footerParts[0]}<br/>{footerParts[1]}</p>
            </div>
        )
    } else if (error === 'API_FETCH_FAILED') {
        title = t('ApiErrorCard.fetchErrorTitle').replace('{context}', context);
        description = t('ApiErrorCard.fetchErrorDescription');
    } else if (error === 'API_NO_DATA') {
        title = t('ApiErrorCard.noDataTitle').replace('{context}', context);
        description = t('ApiErrorCard.noDataDescription');
    }

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="text-destructive" />
                    <span>{title}</span>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            {code && (
                <CardContent>
                    <p className="text-sm font-semibold mb-2">{t('ApiErrorCard.requiredEnvVar')}</p>
                    <CodeBlock code={code} />
                </CardContent>
            )}
            {footer && (
                 <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                    {footer}
                 </CardFooter>
            )}
        </Card>
    );
}
