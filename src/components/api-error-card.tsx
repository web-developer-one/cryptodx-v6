
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { Button } from "./ui/button";

interface ApiErrorCardProps {
    error: string | null;
    context: string;
}

export function ApiErrorCard({ error, context }: ApiErrorCardProps) {
    let title = `Error Loading ${context}`;
    let description: React.ReactNode = `There was an issue fetching data from the API. Please try again later.`;
    let code;
    let footer;

    if (error === 'API_KEY_MISSING') {
        title = "API Key Configuration Error";
        description = (
            <>
                The CoinMarketCap API key is not configured for your production environment. 
                Your local <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">.env</code> file is used for development and is not deployed to production.
            </>
        );
        code = `COINMARKETCAP_API_KEY=your_key_here`;
        footer = (
            <div className="flex flex-col gap-2 w-full">
                <p className="text-sm text-muted-foreground">To fix this, add the variable above to your Netlify site settings:</p>
                <a href="https://app.netlify.com/find/env-vars" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full">
                        Set Environment Variables on Netlify
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </a>
                 <p className="text-xs text-muted-foreground text-center mt-2">Find your site, then navigate to: <br/> Site configuration &gt; Build & deploy &gt; Environment.</p>
            </div>
        )
    } else if (error === 'API_FETCH_FAILED') {
        title = `Error Fetching ${context}`;
        description = `Could not fetch data from the CoinMarketCap API. This may be a temporary network issue. Please try again later.`;
    } else if (error === 'API_NO_DATA') {
        title = `No ${context} Found`;
        description = `The API returned no data for your request.`;
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
                    <p className="text-sm font-semibold mb-2">Required Environment Variable:</p>
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
