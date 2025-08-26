
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getLatestListings } from '@/lib/coinmarketcap';
import type { Cryptocurrency } from '@/lib/types';
import { cn } from '@/lib/utils';

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
      // Use top 30 tokens for the effect
      if (data) {
        setTokens(data.slice(0, 30));
      }
    };
    fetchTokens();
  }, []);

  if (tokens.length === 0) {
    return null;
  }

  const random = mulberry32(12345); // Use a fixed seed

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
      <div className="relative w-full h-full">
        {tokens.map((token) => {
          const size = Math.floor(random() * (80 - 40 + 1) + 40); // Random size between 40 and 80px
          const top = `${random() * 100}%`;
          const left = `${random() * 100}%`;
          const animationDuration = `${random() * (20 - 10) + 10}s`; // 10-20s duration
          const animationDelay = `${random() * 5}s`; // 0-5s delay

          return (
            <div
              key={token.id}
              className="absolute animate-float"
              style={{
                top,
                left,
                animationDuration,
                animationDelay,
              }}
            >
              <Image
                src={token.logo || `https://s2.coinmarketcap.com/static/img/coins/64x64/${token.id}.png`}
                alt={token.name}
                width={size}
                height={size}
                className="rounded-full opacity-10 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
