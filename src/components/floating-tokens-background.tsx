
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getLatestListings } from '@/lib/coinmarketcap';
import type { Cryptocurrency } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import Link from 'next/link';

// Simple pseudo-random number generator for deterministic "randomness"
const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export function FloatingTokensBackground() {
  const [tokens, setTokens] = useState<Cryptocurrency[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      const { data } = await getLatestListings();
      if (data) {
        let topTokens = data.slice(0, 30);
        // Ensure ETH is always in the list for the background effect
        const hasETH = topTokens.some(token => token.symbol === 'ETH');
        if (!hasETH) {
            const ethData = data.find(token => token.symbol === 'ETH');
            if (ethData) {
                // Add ETH and take the next 29 tokens to maintain the count
                topTokens.pop();
                topTokens.unshift(ethData);
            }
        }
        setTokens(topTokens);
      }
    };
    fetchTokens();
  }, []);

  if (tokens.length === 0) {
    return null;
  }

  const random = mulberry32(12345); // Use a fixed seed

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="relative w-full h-full">
        {tokens.map((token) => {
          const size = Math.floor(random() * (80 - 40 + 1) + 40);
          const top = `${Math.min(90, random() * 100)}%`;
          const left = `${Math.min(90, random() * 100)}%`;
          const animationDuration = `${random() * (20 - 10) + 10}s`;
          const animationDelay = `${random() * 5}s`;
          const isAave = token.symbol === 'AAVE';

          return (
            <Link
              key={token.id}
              href={`/tokens/${token.id}`}
              className="absolute animate-float token-container group"
              style={{
                top,
                left,
                animationDuration,
                animationDelay,
                width: size,
                height: size,
              }}
            >
              <div className="relative flex items-center h-full">
                {/* Token Image and Ring */}
                <div
                  className={cn(
                    "relative transition-transform duration-300 group-hover:scale-110",
                    isAave && "scale-110"
                  )}
                  style={{ width: size, height: size }}
                >
                  <div className={cn(
                    "absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    isAave && "opacity-100"
                    )} />
                  <div className="absolute inset-1 rounded-full bg-background" />
                  <Image
                    src={token.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
                    alt={token.name}
                    width={size}
                    height={size}
                    className={cn(
                        "relative z-10 rounded-full opacity-20 group-hover:opacity-100 transition-opacity duration-300",
                        isAave && "opacity-100"
                    )}
                  />
                </div>
                 {/* Token Details */}
                <div 
                  className={cn(
                    "token-details absolute pl-3 flex flex-col justify-center opacity-0 group-hover:opacity-100 group-hover:transform-none transform -translate-x-2 transition-all duration-300",
                    isAave && "opacity-100 transform-none"
                    )}
                   style={{ left: `${size}px` }}
                >
                    <div className="font-bold text-sm text-foreground whitespace-nowrap">{token.symbol}</div>
                    <div className={cn(
                        "flex items-center text-xs whitespace-nowrap",
                        token.change24h >= 0 ? "text-success" : "text-destructive"
                    )}>
                        {token.change24h >= 0 ? <ArrowUp className="h-3 w-3 mr-0.5"/> : <ArrowDown className="h-3 w-3 mr-0.5"/>}
                        {Math.abs(token.change24h).toFixed(2)}%
                    </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
