'use client';

import { useMemo, useState } from 'react';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Generate some fake OHLC data for the chart
const generateChartData = (token: TokenDetails) => {
    const data = [];
    let currentPrice = token.price;
    const volatility = (token.change24h || 1) / 100 * 0.8;

    // Generate 365 days of data to make the scrollbar useful
    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (364 - i));
        
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
    data[364].price = token.price;
    data[364].ohlc[3] = token.price;
    data[364].ohlc[1] = Math.max(data[364].ohlc[1], token.price);
    
    // Ensure simulated high/low match token data
    if (token.high24h) data[364].ohlc[1] = token.high24h;
    if (token.low24h) data[364].ohlc[2] = token.low24h;

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
  const { x, width, ohlc, yAxis } = props;
  if (!ohlc || !yAxis) return null;
  
  const [open, high, low, close] = ohlc;
  const isUp = close >= open;

  // Calculate the y and height for the candle body.
  const y = yAxis.scale(isUp ? close : open);
  const height = Math.max(1, Math.abs(yAxis.scale(open) - yAxis.scale(close)));
  
  const highCoord = yAxis.scale(high);
  const lowCoord = yAxis.scale(low);
  const color = isUp ? 'hsl(145 63% 49%)' : 'hsl(var(--destructive))';
  
  return (
    <g>
      {/* Wick */}
      <line x1={x + width / 2} y1={highCoord} x2={x + width / 2} y2={lowCoord} stroke={color} strokeWidth={1}/>
      {/* Body */}
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={height} 
        fill={isUp ? 'transparent' : color} 
        stroke={color} 
        strokeWidth={1}
      />
    </g>
  );
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
        newIndex = dataLength > 7 ? dataLength - 7 : 0;
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{token.name} Price Chart</CardTitle>
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
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
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
            />
            <Tooltip content={<CustomTooltip />} />
            
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>

            <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />

            <Bar dataKey="ohlc" shape={<CandlestickBar />} />
            
            <Brush 
                dataKey="date" 
                height={20} 
                stroke="hsl(var(--primary))"
                startIndex={brushStartIndex}
                key={brushStartIndex}
                tickFormatter={(index) => chartData[index]?.date}
                travellerWidth={10}
                padding={{ top: 5, bottom: 0}}
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
