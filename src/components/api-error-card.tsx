
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

interface ApiErrorCardProps {
    error: string | null;
    context: string;
}

export function ApiErrorCard({ error, context }: ApiErrorCardProps) {
    let title = `Error Loading ${context}`;
    let description: React.ReactNode = `There was an issue fetching data from the API. Please try again later.`;
    let code;

    if (error === 'API_KEY_MISSING') {
        title = "API Key Configuration Error";
        description = (
            <>
                The CoinMarketCap API key is missing or invalid. To fix this, please add your key
                to the environment variables in your deployment platform (e.g., Netlify, Vercel).
            </>
        );
        code = `COINMARKETCAP_API_KEY=your_key_here`;
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
        </Card>
    );
}
