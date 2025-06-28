
'use client';

import { useMemo, useState } from 'react';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Generate some fake OHLC data for the chart
const generateChartData = (token: TokenDetails) => {
    const data = [];
    let currentPrice = token.price;
    const volatility = (token.change24h || 1) / 100 * 0.5;

    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        const open = currentPrice;
        const close = currentPrice * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ohlc: [open, high, low, close],
            price: close,
        });

        currentPrice = close;
    }
    // Ensure the last data point matches the token's current price
    data[29].price = token.price;
    data[29].ohlc[3] = token.price;
    data[29].ohlc[1] = Math.max(data[29].ohlc[1], token.price);
    
    // Ensure simulated high/low match token data
    if (token.high24h) data[29].ohlc[1] = token.high24h;
    if (token.low24h) data[29].ohlc[2] = token.low24h;

    return data;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const priceData = payload.find(p => p.dataKey === 'ohlc');
    if (!priceData) return null;
    
    const [open, high, low, close] = priceData.value;
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold">{label}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            <span className="text-muted-foreground">Open:</span>
            <span className="font-mono text-right">${open.toFixed(2)}</span>
            <span className="text-muted-foreground">High:</span>
            <span className="font-mono text-right">${high.toFixed(2)}</span>
            <span className="text-muted-foreground">Low:</span>
            <span className="font-mono text-right">${low.toFixed(2)}</span>
            <span className="text-muted-foreground">Close:</span>
            <span className="font-mono text-right">${close.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};


// Custom shape for the candlestick
const CandlestickBar = (props: any) => {
  const { x, yAxis, width, ohlc } = props;
  if (!ohlc || !yAxis) return null;
  
  const [open, high, low, close] = ohlc;
  const isUp = close >= open;

  // We need to calculate the correct y and height for the candle body.
  const y = isUp ? yAxis.scale(close) : yAxis.scale(open);
  const height = Math.abs(yAxis.scale(open) - yAxis.scale(close));
  
  const highCoord = yAxis.scale(high);
  const lowCoord = yAxis.scale(low);
  
  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={highCoord} x2={x + width / 2} y2={lowCoord} stroke={isUp ? "green" : "red"} strokeWidth={1}/>
      {/* Body */}
      <rect x={x} y={y} width={width} height={height} fill={isUp ? "green" : "red"} />
    </g>
  );
};


export function PriceChart({ token }: { token: TokenDetails }) {
  const chartData = useMemo(() => generateChartData(token), [token]);
  const [timeframe, setTimeframe] = useState('1M');

  const timeframes = ['24H', '7D', '1M', '3M', '6M', '1Y'];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <CardTitle>{token.name} Price Chart</CardTitle>
        <div className="flex flex-col items-end gap-2">
          <Link href="/" passHref>
              <Button>Trade {token.symbol}</Button>
          </Link>
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs",
                  timeframe === tf && "bg-accent text-accent-foreground"
                )}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis orientation="right" domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>

            <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />

            <Bar dataKey="ohlc" shape={<CandlestickBar />} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
