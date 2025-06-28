'use client';

import { useMemo, useState } from 'react';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush, Legend } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Generate some fake OHLC and Volume data for the chart
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
        
        // Simulate volume
        const volume = (Math.random() * 50000000 + 20000000) * (1 + Math.abs((close-open)/open) * 5);


        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ohlc: [open, high, low, close],
            price: close,
            volume: volume, // Add volume data
        });

        currentPrice = close;
    }
    // Ensure the last data point matches the token's current price
    data[364].price = token.price;
    data[364].ohlc[3] = token.price;
    data[364].ohlc[1] = Math.max(data[364].ohlc[1], token.price);
    if(token.volume24h) data[364].volume = token.volume24h; // Use real 24h volume for the last day
    
    // Ensure simulated high/low match token data
    if (token.high24h) data[364].ohlc[1] = token.high24h;
    if (token.low24h) data[364].ohlc[2] = token.low24h;

    return data;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pricePayload = payload.find(p => p.dataKey === 'ohlc' || p.dataKey === 'price');
    const volumePayload = payload.find(p => p.dataKey === 'volume');
    
    return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
            <p className="font-bold mb-2">{label}</p>
            {pricePayload && (
                <div className="space-y-1">
                    {pricePayload.dataKey === 'ohlc' ? (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Open:</span><span className="font-mono text-right">${(pricePayload.value[0] as number).toFixed(2)}</span>
                            <span className="text-muted-foreground">High:</span><span className="font-mono text-right">${(pricePayload.value[1] as number).toFixed(2)}</span>
                            <span className="text-muted-foreground">Low:</span><span className="font-mono text-right">${(pricePayload.value[2] as number).toFixed(2)}</span>
                            <span className="text-muted-foreground">Close:</span><span className="font-mono text-right">${(pricePayload.value[3] as number).toFixed(2)}</span>
                        </div>
                    ) : (
                         <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Price:</span><span className="font-mono text-right">${(pricePayload.value as number).toLocaleString()}</span>
                         </div>
                    )}
                </div>
            )}
            {volumePayload && (
                 <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t">
                    <span className="text-muted-foreground">Volume:</span><span className="font-mono text-right">${(volumePayload.value as number).toLocaleString(undefined, {notation: 'compact'})}</span>
                </div>
            )}
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
        fill={color}
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
  const [chartView, setChartView] = useState<'line' | 'candlestick'>('line');

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
  
  const yAxisPadding = { top: 20, bottom: 80 }; // Add padding for volume chart
  const volumeColor = "hsl(var(--chart-3))";


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-y-2">
          <div>
            <CardTitle>{token.name} Price Chart</CardTitle>
            <div className="mt-2 flex items-center gap-1 rounded-md bg-muted p-1 w-fit">
               <Button
                variant={chartView === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setChartView('line')}
              >
                Line
              </Button>
              <Button
                variant={chartView === 'candlestick' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setChartView('candlestick')}
              >
                Candlestick
              </Button>
            </div>
          </div>
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
                domain={['dataMin', 'dataMax']}
                tickMargin={10}
            />
            <YAxis 
                yAxisId="price"
                orientation="right" 
                domain={['auto', 'auto']} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                axisLine={false}
                tickLine={false}
                padding={yAxisPadding}
                width={60}
            />
            <YAxis 
                yAxisId="volume"
                orientation="left" 
                domain={['auto', 'auto']} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString(undefined, {notation: 'compact'})}
                axisLine={false}
                tickLine={false}
                padding={yAxisPadding}
                width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={30} />
            
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>

            {chartView === 'line' ? (
                <Area yAxisId="price" type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} name="Price" />
            ) : (
                <Bar yAxisId="price" dataKey="ohlc" shape={<CandlestickBar />} name="Price" />
            )}
            
            <Bar yAxisId="volume" dataKey="volume" fill={volumeColor} opacity={0.5} name="Volume" />

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
