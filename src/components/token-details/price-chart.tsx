
'use client'

import * as React from "react"
import { Area, Bar, ComposedChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import type { TokenDetails } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Generate OHLC and Volume data for the chart
const generateCandlestickData = (currentPrice: number, days: number, baseVolume: number) => {
  const data = [];
  
  // For 24H view (days=1), generate hourly data
  if (days === 1) {
    let lastClose = currentPrice * (1 - 0.02 - (Math.random() * 0.01)); // start 2-3% lower 24h ago
    for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        
        const open = lastClose;
        const trend = (currentPrice - open) / (i + 1);
        const change = trend * (0.5 + Math.random()) + (Math.random() - 0.5) * open * 0.005;
        let close = open + change;
        if (i === 0) close = currentPrice;

        const high = Math.max(open, close) * (1 + Math.random() * 0.002);
        const low = Math.min(open, close) * (1 - Math.random() * 0.002);
        const volume = baseVolume * (1 + Math.random() * 0.5) * (1 + Math.abs(change) / open * 10);


        data.push({
            date: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            open: parseFloat(open.toFixed(4)),
            high: parseFloat(high.toFixed(4)),
            low: parseFloat(low.toFixed(4)),
            close: parseFloat(close.toFixed(4)),
            volume: parseFloat(volume.toFixed(0)),
        });
        lastClose = close;
    }
    return data;
  }

  // For other views, generate daily data
  let lastClose = currentPrice * (1 - (days / 365) * 0.4 - (Math.random() * 0.1)); // Start price lower for longer ranges

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = lastClose;
    const trend = (currentPrice - open) / (i + 1);
    const change = trend * (0.5 + Math.random()) + (Math.random() - 0.5) * open * 0.05;
    let close = open + change;

    if (i === 0) {
      close = currentPrice;
    }
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    const volume = baseVolume * (1 + Math.random()) * (1 + Math.abs(change) / open * 5);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      volume: parseFloat(volume.toFixed(0)),
    });
    
    lastClose = close;
  }
  return data;
};


// Custom shape for the candlestick body
const CandleBody = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, close } = payload;
  const isGrowing = close > open;
  const fill = isGrowing ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
  
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};

// Custom shape for the candlestick wick
const Wick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const { open, close } = payload;
    const isGrowing = close > open;
    const stroke = isGrowing ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))';
    return <rect x={x + (width / 2) - 0.5} y={y} width={1} height={height} fill={stroke} />;
};


const CustomTooltip = ({ active, payload, chartType }: any) => {
  if (active && payload && payload.length) {
    const priceData = payload.find(p => p.dataKey === 'close' || (p.dataKey as any[])?.includes?.('low'));
    const volumeData = payload.find(p => p.dataKey === 'volume');
      
    if (!priceData) return null;
    const data = priceData.payload;

    return (
      <div className="p-2 text-xs rounded-md border bg-popover text-popover-foreground shadow-md">
        <p className="font-bold">{data.date}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            {chartType === 'candle' ? (
                <>
                    <span className="text-muted-foreground">Open:</span><span className="font-mono text-right">${data.open.toLocaleString()}</span>
                    <span className="text-muted-foreground">High:</span><span className="font-mono text-right">${data.high.toLocaleString()}</span>
                    <span className="text-muted-foreground">Low:</span><span className="font-mono text-right">${data.low.toLocaleString()}</span>
                    <span className="text-muted-foreground">Close:</span><span className="font-mono text-right">${data.close.toLocaleString()}</span>
                </>
            ) : (
                <><span className="text-muted-foreground">Price:</span><span className="font-mono text-right">${data.close.toLocaleString()}</span></>
            )}
            {volumeData && (
                <><span className="text-muted-foreground">Volume:</span><span className="font-mono text-right">${volumeData.value.toLocaleString()}</span></>
            )}
        </div>
      </div>
    );
  }
  return null;
};

const timeRangeOptions = {
    "24H": { days: 1, description: "Last 24 hours" },
    "7D": { days: 7, description: "Last 7 days" },
    "1M": { days: 30, description: "Last 30 days" },
    "3M": { days: 90, description: "Last 3 months" },
    "6M": { days: 180, description: "Last 6 months" },
    "1Y": { days: 365, description: "Last year" },
};
type TimeRangeKey = keyof typeof timeRangeOptions;


export function PriceChart({ token }: { token: TokenDetails }) {
  const [chartData, setChartData] = React.useState<any[]>([])
  const [timeRange, setTimeRange] = React.useState<TimeRangeKey>("1M");
  const [chartType, setChartType] = React.useState<'line' | 'candle'>('line');

  React.useEffect(() => {
    const days = timeRangeOptions[timeRange].days;
    // Use token.volume24h as a base for mock volume generation
    const baseDailyVolume = (token.volume24h || 50_000_000) / (days > 1 ? 30 : 1);
    setChartData(generateCandlestickData(token.price, days, baseDailyVolume));
  }, [token.price, token.volume24h, timeRange]);

  const chartConfig = {
    price: { color: "hsl(var(--chart-2))" },
    volume: { color: "hsl(var(--chart-1))" },
  }

  const yPriceDomain = React.useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const prices = chartData.flatMap(d => chartType === 'candle' ? [d.low, d.high] : [d.close]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData, chartType]);
  
  const yVolumeDomain = React.useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const max = Math.max(...chartData.map(d => d.volume));
    return [0, max * 1.5]; // Add 50% padding for volume bars
  }, [chartData]);
  
  const description = `${timeRangeOptions[timeRange].description} price movement for ${token.symbol}.`;

  return (
    <Card>
      <CardHeader className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle>{token.name} Price Chart</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(timeRangeOptions) as TimeRangeKey[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
           <div className="flex items-center gap-1 border-l ml-2 pl-2">
            <Button variant={chartType === 'line' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('line')}>Line</Button>
            <Button variant={chartType === 'candle' ? 'secondary' : 'ghost'} size="sm" onClick={() => setChartType('candle')}>Candle</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[450px] w-full">
          {chartData.length > 0 ? (
            <ComposedChart 
              data={chartData} 
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={timeRange !== '24H'} // Hide ticks on hourly view for cleanliness
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`}
                domain={yPriceDomain}
                allowDataOverflow
              />
               <YAxis
                yAxisId="volume"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => Number(value).toLocaleString('en-US', { notation: 'compact' })}
                domain={yVolumeDomain}
                allowDataOverflow
              />
              <Tooltip 
                  content={<CustomTooltip chartType={chartType} />} 
                  cursor={{
                      stroke: 'hsl(var(--border))',
                      strokeWidth: 1,
                      strokeDasharray: '3 3',
                  }}
              />
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="hsl(var(--chart-1))"
                opacity={0.3}
                barSize={20}
                animationDuration={300}
              />
              {chartType === 'line' ? (
                <>
                    <Area yAxisId="price" type="monotone" dataKey="close" strokeWidth={0} fill="url(#fillPrice)" />
                    <Line
                        yAxisId="price"
                        type="monotone"
                        dataKey="close"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                    />
                </>
              ) : (
                <>
                  <Bar
                    yAxisId="price"
                    dataKey={['low', 'high']}
                    shape={<Wick />}
                    animationDuration={300}
                  />
                  <Bar
                    yAxisId="price"
                    dataKey={(item) => [Math.min(item.open, item.close), Math.max(item.open, item.close)]}
                    barSize={10}
                    shape={<CandleBody />}
                    animationDuration={300}
                  />
                </>
              )}
              <Brush 
                key={`${timeRange}-${chartType}`}
                dataKey="date" 
                height={40} 
                stroke="hsl(var(--primary))" 
                travellerWidth={20}
                y={400}
                data={chartData}
                startIndex={Math.max(0, chartData.length - 30)}
              />
            </ComposedChart>
          ) : (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-full w-full" />
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
