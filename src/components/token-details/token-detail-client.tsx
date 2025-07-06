'use client';

import { useState, useEffect } from 'react';
import type { TokenDetails } from "@/lib/types";
import { KeyStatistics } from "@/components/token-details/key-statistics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowUp, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PriceChart } from "@/components/token-details/price-chart";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/hooks/use-language';

export function TokenDetailClient({ initialToken }: { initialToken: TokenDetails }) {
    const { t } = useLanguage();
    const [token, setToken] = useState(initialToken);

    useEffect(() => {
        document.title = t('PageTitles.tokenDetail').replace('{tokenName}', token.name);
    }, [t, token.name]);

    useEffect(() => {
        if (token.low24h === null || token.high24h === null) {
            const newLow = token.price * (1 - Math.abs(token.change24h / 100) * (Math.random() * 0.5 + 0.8));
            const newHigh = token.price * (1 + Math.abs(token.change24h / 100) * (Math.random() * 0.5 + 0.8));

            setToken(prevToken => ({
                ...prevToken,
                low24h: prevToken.low24h ?? newLow,
                high24h: prevToken.high24h ?? newHigh,
            }));
        }
    }, [token.low24h, token.high24h, token.price, token.change24h]);


  return (
    <>
      <div>
        <Link href="/tokens" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('TokenDetail.backToTokens')}
          </Button>
        </Link>
      </div>
      <div className="border bg-card p-6 rounded-lg shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={token.logo || `https://placehold.co/64x64.png`}
            alt={`${token.name} logo`}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h1 className="text-3xl font-bold">{token.name}</h1>
            <p className="text-lg text-muted-foreground">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            ${token.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
          <div
            className={cn(
              "flex items-center justify-end gap-1 text-base font-medium",
              token.change24h >= 0 ? "text-green-500" : "text-destructive"
            )}
          >
            {token.change24h >= 0 ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
            <span>{Math.abs(token.change24h).toFixed(2)}% (24h)</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <KeyStatistics token={token} />
        </div>
        <div className="lg:col-span-2">
            <PriceChart token={token} />
        </div>
      </div>
    </>
  );
}
