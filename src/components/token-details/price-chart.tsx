
'use client';

import { useMemo, useState } from 'react';
import { Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush, Bar, Legend } from 'recharts';
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
        
        const open = currentPrice;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        let close = open + change;

        const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5);
        const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5);
        
        // Ensure close is within high/low
        close = Math.max(low, Math.min(high, close));

        const volume = (Math.random() * token.volume24h * 0.1) + (token.volume24h * 0.05);

        data.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: close, // for line chart
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume,
        });

        currentPrice = close;
    }
    // Ensure the last data point matches the token's current price
    const lastDataPoint = data[364];
    lastDataPoint.price = token.price;
    lastDataPoint.close = token.price;
    if (token.price > lastDataPoint.open) {
        lastDataPoint.high = Math.max(lastDataPoint.high, token.price);
    } else {
        lastDataPoint.low = Math.min(lastDataPoint.low, token.price);
    }

    return data;
};


const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold mb-2">{label}</p>
        {chartType === 'candlestick' && (
          <>
            <div className="space-y-1">
              <p>O: <span className="font-mono">${data.open.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span></p>
              <p>H: <span className="font-mono">${data.high.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span></p>
              <p>L: <span className="font-mono">${data.low.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span></p>
              <p>C: <span className="font-mono">${data.close.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}</span></p>
            </div>
            <p className="mt-2">Vol: <span className="font-mono">{data.volume.toLocaleString(undefined, {notation: 'compact'})}</span></p>
          </>
        )}
        {chartType === 'line' && payload[0]?.value && (
           <p className="font-bold text-muted-foreground">
              ${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 4})}
            </p>
        )}
      </div>
    );
  }

  return null;
};

// Custom shape for candlestick body and wick
const Candlestick = (props: any) => {
  const { x, y, width, height, low, high, payload, yAxis } = props;

  if (!yAxis || typeof yAxis.scale !== 'function') {
    return null;
  }
  
  const isUp = payload.close >= payload.open;
  const fill = isUp ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'; // Green for up, Red for down
  const wickX = x + width / 2;

  // recharts passes y and height for the bar body [open, close]
  // We need to draw the wicks from high to low
  // Note: recharts y-axis is inverted (0 is at the top)
  const highWickY = yAxis.scale(high);
  const lowWickY = yAxis.scale(low);

  return (
    <g>
      {/* Wick */}
      <line x1={wickX} y1={highWickY} x2={wickX} y2={lowWickY} stroke={fill} strokeWidth={1} />
      {/* Body */}
      <rect x={x} y={y} width={width} height={height} fill={fill} />
    </g>
  );
};

export function PriceChart({ token }: { token: TokenDetails }) {
  const [chartType, setChartType] = useState('line');
  const chartData = useMemo(() => generateChartData(token), [token]);
  const [timeframe, setTimeframe] = useState('1M');
  const [brushStartIndex, setBrushStartIndex] = useState(chartData.length > 30 ? chartData.length - 30 : 0);

  const timeframes = ['24H', '7D', '1M', '3M', '6M', '1Y'];
  const chartViews = ['Line', 'Candlestick'];

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

  const priceDomain = useMemo(() => {
    if (!chartData.length) return [0, 0];
    const visibleData = chartData.slice(brushStartIndex);
    if (!visibleData.length) return [0, 0];
    const prices = visibleData.map(d => d.high).concat(visibleData.map(d => d.low));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData, brushStartIndex]);

  const volumeDomain = useMemo(() => {
    if (!chartData.length) return [0, 0];
    const visibleData = chartData.slice(brushStartIndex);
    if (!visibleData.length) return [0, 0];
    const volumes = visibleData.map(d => d.volume);
    return [0, Math.max(...volumes) * 4]; // Give volume chart more space at the top
  }, [chartData, brushStartIndex]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className='flex flex-col gap-2'>
                <CardTitle>Price Chart</CardTitle>
                <div className="flex items-center gap-1">
                    {chartViews.map((view) => (
                      <Button
                        key={view}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs",
                          chartType === view.toLowerCase() && "bg-accent text-accent-foreground"
                        )}
                        onClick={() => setChartType(view.toLowerCase())}
                      >
                        {view}
                      </Button>
                    ))}
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
        {chartType === 'line' ? (
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
            <Tooltip content={<CustomTooltip chartType="line" />} />
            
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
                key={`line-${brushStartIndex}`} // Force re-render on index change
                tickFormatter={(index) => chartData[index]?.date}
                travellerWidth={10}
                y={385} // Position brush at the very bottom
            >
                <ComposedChart>
                    <Area dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </ComposedChart>
            </Brush>
          </ComposedChart>
        ) : (
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
                yAxisId="price"
                orientation="right" 
                domain={priceDomain} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                axisLine={false}
                tickLine={false}
                width={60}
            />
             <YAxis 
                yAxisId="volume"
                orientation="left" 
                domain={volumeDomain}
                hide={true} // Hide axis line and ticks, but keep for scale
            />
            <Tooltip content={<CustomTooltip chartType="candlestick" />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend verticalAlign="top" wrapperStyle={{top: -5, right: 20, fontSize: 12}}/>

            <Bar name="Volume" dataKey="volume" yAxisId="volume" fill="hsl(var(--muted))" />
            
            <Bar
              name="Price"
              dataKey={['open', 'close']}
              yAxisId="price"
              shape={Candlestick}
            />

             <Brush 
                dataKey="date" 
                height={15} 
                stroke="hsl(var(--primary))"
                startIndex={brushStartIndex}
                endIndex={chartData.length - 1}
                key={`candle-${brushStartIndex}`} // Force re-render on index change
                tickFormatter={(index) => chartData[index]?.date}
                travellerWidth={10}
                y={385}
            >
                <ComposedChart>
                    {/* Simplified view in brush */}
                    <Area dataKey="close" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                </ComposedChart>
            </Brush>
          </ComposedChart>
        )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
