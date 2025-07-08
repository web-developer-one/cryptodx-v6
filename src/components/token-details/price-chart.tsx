
'use client';

import { useMemo, useState } from 'react';
import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush, ComposedChart, Customized, Bar, BarChart } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Generate realistic OHLC and price data for the chart
const generatePriceHistory = (token: TokenDetails) => {
    const data = [];
    // Estimate a starting price from 365 days ago based on a simplified daily trend
    const dailyTrend = token.change24h / 100 / 30; // Smooth out the 24h change over a month
    let previousClose = token.price / Math.pow(1 + dailyTrend, 365);
    if (previousClose <= 0) previousClose = token.price > 0.01 ? token.price * 0.5 : 0.01;


    for (let i = 0; i < 365; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (364 - i));
        
        const open = previousClose;
        const volatility = 0.05; // Base volatility for price swings
        const rand = Math.random() - 0.48; // A slight upward bias
        const change = rand * open * volatility;
        
        let close = open + change;
        if(close <= 0) close = open * 0.9;

        // Generate high and low based on volatility
        const high = Math.max(open, close) * (1 + (Math.random() * volatility));
        const low = Math.min(open, close) * (1 - (Math.random() * volatility));

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: close,
            ohlc: [open, high, low, close],
        });
        
        previousClose = close;
    }
    
    // Ensure the last data point accurately reflects the current token price
    const lastDataPoint = data[364];
    const [lastOpen] = lastDataPoint.ohlc;
    lastDataPoint.price = token.price;
    lastDataPoint.ohlc[3] = token.price; // Set final close to the actual current price
    lastDataPoint.ohlc[1] = Math.max(lastDataPoint.ohlc[1], lastOpen, token.price); // Ensure high is correct
    lastDataPoint.ohlc[2] = Math.min(lastDataPoint.ohlc[2], lastOpen, token.price); // Ensure low is correct
    
    return data;
};

// Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold mb-1">{label}</p>
        <p className="font-bold text-muted-foreground">
            ${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}
        </p>
      </div>
    );
  }
  return null;
};

// Tooltip for Candlestick Chart
const CustomCandleTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data.ohlc) return null;

    const [open, high, low, close] = data.ohlc;
    
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold mb-1">{label}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-muted-foreground">Open:</span> <span className="font-mono text-right">${open.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">High:</span> <span className="font-mono text-right">${high.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">Low:</span> <span className="font-mono text-right">${low.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">Close:</span> <span className="font-mono text-right">${close.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom component to render candlestick shapes
const CandlestickSeries = (props: any) => {
    const { data, yAxis, xAxis } = props;
    
    return (
        <g>
            {data.map((d: any, i: number) => {
                const [open, high, low, close] = d.ohlc;
                if ([open, high, low, close].some(v => v === undefined || v === null)) return null;

                const isGrowing = close >= open;
                const color = isGrowing ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
                
                const x = xAxis.scale(d.date);
                const bandWidth = xAxis.bandwidth;

                if (x === undefined || bandWidth === undefined) return null;
                
                const yMax = yAxis.scale(Math.max(open, close));
                const yMin = yAxis.scale(Math.min(open, close));

                return (
                    <g key={i} stroke={color} fill={color} strokeWidth={1}>
                        <path d={`M ${x + bandWidth / 2} ${yAxis.scale(high)} L ${x + bandWidth / 2} ${yAxis.scale(low)}`} />
                        <rect 
                            x={x} 
                            y={yMin}
                            width={bandWidth} 
                            height={yMax - yMin}
                        />
                    </g>
                );
            })}
        </g>
    )
}

export function PriceChart({ token }: { token: TokenDetails }) {
  const { t } = useLanguage();
  const chartData = useMemo(() => generatePriceHistory(token), [token]);
  const [activeTab, setActiveTab] = useState("line");
  const [timeframe, setTimeframe] = useState('1M');
  const [brushStartIndex, setBrushStartIndex] = useState(chartData.length > 30 ? chartData.length - 30 : 0);

  const timeframes = ['24H', '7D', '1M', '3M', '6M', '1Y'];

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    const dataLength = chartData.length;
    let newIndex = 0;
    switch (tf) {
      case '24H': newIndex = dataLength > 7 ? dataLength - 7 : 0; break;
      case '7D': newIndex = dataLength > 7 ? dataLength - 7 : 0; break;
      case '1M': newIndex = dataLength > 30 ? dataLength - 30 : 0; break;
      case '3M': newIndex = dataLength > 90 ? dataLength - 90 : 0; break;
      case '6M': newIndex = dataLength > 180 ? dataLength - 180 : 0; break;
      case '1Y': newIndex = 0; break;
      default: newIndex = dataLength > 30 ? dataLength - 30 : 0;
    }
    setBrushStartIndex(newIndex);
  };
  
  const yAxisDomain = useMemo(() => {
    if(!chartData || chartData.length === 0) return [0, 1];
    const visibleData = chartData.slice(brushStartIndex, chartData.length);
    if(visibleData.length === 0) return [0,1];

    let min = Infinity;
    let max = -Infinity;

    if(activeTab === 'line') {
        min = Math.min(...visibleData.map(d => d.price));
        max = Math.max(...visibleData.map(d => d.price));
    } else { // candlestick
        min = Math.min(...visibleData.map(d => d.ohlc[2])); // low
        max = Math.max(...visibleData.map(d => d.ohlc[1])); // high
    }
    
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData, brushStartIndex, activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="line">
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle>{t('TokenDetail.priceChartTitle').replace('{tokenName}', token.name)}</CardTitle>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <Link href="/" passHref>
                        <Button>{t('TokenDetail.trade').replace('{symbol}', token.symbol)}</Button>
                    </Link>
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                        <TabsList className="h-7">
                            <TabsTrigger value="line" className="text-xs px-2 h-6">{t('TokenDetail.line')}</TabsTrigger>
                            <TabsTrigger value="candlestick" className="text-xs px-2 h-6">{t('TokenDetail.candlestick')}</TabsTrigger>
                        </TabsList>
                        {timeframes.map((tf) => (
                        <Button
                            key={tf}
                            variant="ghost"
                            size="sm"
                            className={cn( "h-7 px-2 text-xs", timeframe === tf && "bg-accent text-accent-foreground" )}
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
                <TabsContent value="line" className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                            <YAxis orientation="right" domain={yAxisDomain} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}`} axisLine={false} tickLine={false} width={80}/>
                            <Tooltip content={<CustomLineTooltip />} />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                            <Brush dataKey="date" height={15} stroke="hsl(var(--primary))" startIndex={brushStartIndex} endIndex={chartData.length - 1} key={`line-${brushStartIndex}`} tickFormatter={(index) => chartData[index]?.date} travellerWidth={10} y={385}>
                                <ComposedChart>
                                    <Area dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                                </ComposedChart>
                            </Brush>
                        </ComposedChart>
                    </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="candlestick" className="w-full h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} scale="band" />
                            <YAxis orientation="right" domain={yAxisDomain} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}`} axisLine={false} tickLine={false} width={80}/>
                            <Tooltip content={<CustomCandleTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                            <Customized component={<CandlestickSeries data={chartData} />} />
                            <Brush dataKey="date" height={15} stroke="hsl(var(--primary))" startIndex={brushStartIndex} endIndex={chartData.length - 1} key={`candle-${brushStartIndex}`} tickFormatter={(index) => chartData[index]?.date} travellerWidth={10} y={385}>
                                <BarChart data={chartData}>
                                    <Bar dataKey="price" fill="hsl(var(--primary))" />
                                </BarChart>
                            </Brush>
                        </ComposedChart>
                    </ResponsiveContainer>
                </TabsContent>
            </CardContent>
        </Card>
    </Tabs>
  );
}
