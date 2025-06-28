
'use client';

import { useMemo, useState } from 'react';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell, Brush, Line } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Generate more realistic OHLCV data for the chart
const generateChartData = (token: TokenDetails, timeRange: string) => {
    const data = [];
    let currentPrice = token.price;
    const volatility = (token.change24h || 1) / 100 * 0.5;
    const baseVolume = (token.volume24h || 1000000) / 30;

    let days;
    switch (timeRange) {
        case '24H': days = 1; break;
        case '7D': days = 7; break;
        case '1M': days = 30; break;
        case '3M': days = 90; break;
        case '6M': days = 180; break;
        case '1Y': days = 365; break;
        default: days = 30;
    }

    // Generate historical data backwards from the current price
    for (let i = days; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const trend = volatility / days;
        // Simulate a random walk for the price
        const randomWalk = (Math.random() - 0.5) * 2 * (volatility / 2);
        const open = currentPrice / (1 + trend + randomWalk);
        
        const highFluctuation = Math.random() * (volatility / 4);
        const lowFluctuation = Math.random() * (volatility / 4);
        
        let high, low, close;

        // Ensure open is not always the lowest or highest
        if (Math.random() > 0.5) { // Price went up
            close = open * (1 + Math.random() * (volatility / 3));
            high = Math.max(open, close) * (1 + highFluctuation);
            low = Math.min(open, close) * (1 - lowFluctuation);
        } else { // Price went down
            close = open * (1 - Math.random() * (volatility / 3));
            high = Math.max(open, close) * (1 + highFluctuation);
            low = Math.min(open, close) * (1 - lowFluctuation);
        }
        
        const volume = baseVolume * (1 + (Math.random() - 0.5) * 0.8);

        data.push({
            date: date.getTime(),
            ohlc: [open, high, low, close],
            volume: volume,
        });
        
        // The previous day's close is this day's open
        currentPrice = open;
    }

    // Add current day's data, ensuring it reflects the token's stats
    const lastDataPoint = data[data.length-1];
    data.push({
        date: new Date().getTime(),
        ohlc: [lastDataPoint?.ohlc[3] || token.price * 0.99, token.high24h || token.price * 1.02, token.low24h || token.price * 0.98, token.price],
        volume: baseVolume * (1 + (Math.random() - 0.5)),
    });

    return data;
};


const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (active && payload && payload.length) {
    const date = new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const pricePayload = payload.find(p => p.name === 'Price' || p.dataKey === 'ohlc');
    const volumePayload = payload.find(p => p.name === 'Volume');

    if (!pricePayload) return null;

    let priceContent;
    if (chartType === 'line' && pricePayload.value) {
        const close = pricePayload.payload.ohlc[3];
        priceContent = (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                 <span className="text-muted-foreground">Price:</span>
                <span className="font-mono text-right">{close.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
        )
    } else if (chartType === 'candlestick') {
        const [open, high, low, close] = pricePayload.value;
        priceContent = (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                <span className="text-muted-foreground">Open:</span>
                <span className="font-mono text-right">{open.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                <span className="text-muted-foreground">High:</span>
                <span className="font-mono text-right">{high.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                <span className="text-muted-foreground">Low:</span>
                <span className="font-mono text-right">{low.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                <span className="text-muted-foreground">Close:</span>
                <span className="font-mono text-right">{close.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
            </div>
        )
    }

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold">{date}</p>
        {priceContent}
        {volumePayload && <>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
                <span className="text-muted-foreground">Volume:</span>
                <span className="font-mono text-right">{volumePayload.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', notation: 'compact' })}</span>
            </div>
        </>}
      </div>
    );
  }
  return null;
};


const CandlestickBar = (props: any) => {
  const { x, width, ohlc, yAxis } = props;
  if (!yAxis || !ohlc) return null;
  
  const [open, high, low, close] = ohlc;
  const isUp = close >= open;

  const y = isUp ? yAxis.scale(close) : yAxis.scale(open);
  const height = Math.max(Math.abs(yAxis.scale(open) - yAxis.scale(close)), 1);
  const highCoord = yAxis.scale(high);
  const lowCoord = yAxis.scale(low);
  
  const strokeColor = isUp ? 'hsl(145 63% 49%)' : 'hsl(var(--destructive))';
  const fillColor = isUp ? 'transparent' : strokeColor;

  return (
    <g stroke={strokeColor} fill={fillColor} strokeWidth="1">
      {/* Wick */}
      <path d={`M ${x + width / 2} ${highCoord} L ${x + width / 2} ${lowCoord}`} />
      {/* Body */}
      <rect x={x} y={y} width={width} height={height} strokeWidth={isUp ? 1 : 0} />
    </g>
  );
};


const timeRanges = ['24H', '7D', '1M', '3M', '6M', '1Y'];

export function PriceChart({ token }: { token: TokenDetails }) {
  const [timeRange, setTimeRange] = useState('1M');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const chartData = useMemo(() => generateChartData(token, timeRange), [token, timeRange]);
  
  const [brushStartIndex, setBrushStartIndex] = useState(Math.max(0, chartData.length - 30));
  const [brushEndIndex, setBrushEndIndex] = useState(chartData.length - 1);
  
  // Update brush on time range change
  useState(() => {
    setBrushStartIndex(Math.max(0, chartData.length - 30));
    setBrushEndIndex(chartData.length - 1);
  });

  const priceDomain = useMemo(() => {
    const visibleData = chartData.slice(brushStartIndex, brushEndIndex + 1);
    if (visibleData.length === 0) return ['auto', 'auto'];
    let min = Infinity;
    let max = -Infinity;
    visibleData.forEach(d => {
        const [, high, low] = d.ohlc;
        if (high > max) max = high;
        if (low < min) min = low;
    });
    if (min === Infinity || max === -Infinity) return ['auto', 'auto'];
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData, brushStartIndex, brushEndIndex]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>{token.name} Price Chart</CardTitle>
          <div className="text-muted-foreground text-sm">Last {timeRange === '1M' ? '30 days' : timeRange}</div>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <Button variant={chartType === 'line' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('line')}>Line</Button>
                <Button variant={chartType === 'candlestick' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('candlestick')}>Candles</Button>
            </div>
             <div className="flex items-center gap-1">
                {timeRanges.map(range => (
                    <Button key={range} variant={timeRange === range ? 'secondary' : 'ghost'} size="sm" onClick={() => setTimeRange(range)}>
                        {range}
                    </Button>
                ))}
            </div>
            <Link href="/">
                <Button>Trade {token.symbol}</Button>
            </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart 
            data={chartData} 
            margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
            syncId="priceChart"
          >
            <CartesianGrid strokeDasharray="3 3" vertical />
            <XAxis 
                dataKey="date" 
                tickFormatter={() => ''}
                tickLine={false}
                axisLine={false}
                scale="time"
                type="number"
                domain={[chartData[brushStartIndex]?.date, chartData[brushEndIndex]?.date]}
            />
            <YAxis 
                yAxisId="price"
                orientation="right" 
                domain={priceDomain}
                tickFormatter={(value) => `$${typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}`}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                tickLine={false}
                axisLine={false}
                width={80}
            />

            <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{ strokeDasharray: '3 3' }} />
            
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>

            {chartType === 'line' ? (
                <>
                    <Area type="monotone" dataKey="ohlc[3]" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} yAxisId="price" name="Price" isAnimationActive={false} />
                </>
            ) : (
                <Bar dataKey="ohlc" yAxisId="price" shape={<CandlestickBar />} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        <ResponsiveContainer width="100%" height={100}>
             <ComposedChart 
                data={chartData} 
                margin={{ top: 10, right: 0, bottom: 20, left: 0 }}
                syncId="priceChart"
            >
                <YAxis yAxisId="volume" hide domain={['auto', 'dataMax * 4']} />
                <Bar dataKey="volume" yAxisId="volume" barSize={20} isAnimationActive={false}>
                    {chartData.map((entry, index) => {
                        const [open, , , close] = entry.ohlc;
                        return <Cell key={`cell-${index}`} fill={close >= open ? 'hsl(145 63% 49% / 0.5)' : 'hsl(var(--destructive) / 0.5)'} />;
                    })}
                </Bar>
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(time) => new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    scale="time"
                    type="number"
                    domain={[chartData[brushStartIndex]?.date, chartData[brushEndIndex]?.date]}
                />
                 <Brush 
                    dataKey="date"
                    height={40}
                    stroke="hsl(var(--primary))"
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    onChange={(e) => {
                        if (e.startIndex !== null && e.endIndex !== null) {
                            setBrushStartIndex(e.startIndex);
                            setBrushEndIndex(e.endIndex);
                        }
                    }}
                    tickFormatter={(time) => new Date(time).toLocaleDateString('en-US', { month: 'short' })}
                    y={50}
                />
            </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
