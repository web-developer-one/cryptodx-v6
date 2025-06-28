
'use client';

import { useMemo, useState } from 'react';
import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ComposedChart } from 'recharts';

// Generate some fake price data for the chart
const generateChartData = (token: TokenDetails) => {
    const data = [];
    let currentPrice = token.price;
    const volatility = (token.change24h || 1) / 100 * 0.5;

    // Generate 365 days of data to make the scrollbar useful
    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (364 - i));
        
        const change = (Math.random() - 0.5) * volatility;
        currentPrice *= (1 + change);

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: currentPrice,
        });
    }
    // Ensure the last data point matches the token's current price
    data[364].price = token.price;

    return data;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-xs uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              ${payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function PriceChart({ token }: { token: TokenDetails }) {
  const chartData = useMemo(() => generateChartData(token), [token]);
  const [timeframe, setTimeframe] = useState('1M');
  const [brushStartIndex, setBrushStartIndex] = useState(chartData.length > 30 ? chartData.length - 30 : 0);

  const timeframes = ['24H', '7D', '1M', '3M', '6M', '1Y'];

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    const dataLength = chartData.length;
    let newIndex = 0;
    switch (tf) {
      case '24H':
        newIndex = dataLength > 7 ? dataLength - 7 : 0; // Using 7 days for 24h as we don't have hourly data
        break;
      case '7D':
        newIndex = dataLength > 7 ? dataLength - 7 : 0;
        break;
      case '1M':
        newIndex = dataLength > 30 ? dataLength - 30 : 0;
        break;
      case '3M':
        newIndex = dataLength > 90 ? dataLength - 90 : 0;
        break;
      case '6M':
        newIndex = dataLength > 180 ? dataLength - 180 : 0;
        break;
      case '1Y':
        newIndex = 0;
        break;
      default:
        newIndex = dataLength > 30 ? dataLength - 30 : 0;
    }
    setBrushStartIndex(newIndex);
  };
  
  const yAxisPadding = { top: 20, bottom: 20 };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex flex-col items-end gap-2">
              <Link href="/" passHref>
                  <Button>Trade {token.symbol}</Button>
              </Link>
              <div className="flex items-center justify-end gap-1">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 px-2 text-xs",
                      timeframe === tf && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleTimeframeChange(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
             <XAxis 
                dataKey="date" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
            />
            <YAxis 
                orientation="right" 
                domain={['auto', 'auto']} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                axisLine={false}
                tickLine={false}
                padding={yAxisPadding}
                width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
            <Brush 
                dataKey="date" 
                height={15} 
                stroke="hsl(var(--primary))"
                startIndex={brushStartIndex}
                endIndex={chartData.length - 1}
                key={brushStartIndex} // Force re-render on index change
                tickFormatter={(index) => chartData[index]?.date}
                travellerWidth={10}
                y={385} // Position brush at the very bottom
            >
                {/* Custom chart inside the brush */}
                <ComposedChart>
                    <Area dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </ComposedChart>
            </Brush>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
