
'use client'

import * as React from "react"
import { Area, Bar, CartesianGrid, Cell, ComposedChart, Line, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis, Brush } from "recharts"
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

// Generate more realistic OHLCV data
const generatePriceData = (currentPrice: number, days: number) => {
  const data = [];
  let lastPrice = currentPrice * (1 - (days / 365) * 0.4 - (Math.random() * 0.1));
  const baseVolume = 1000000 + Math.random() * 50000000;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const trend = (currentPrice - lastPrice) / (i + 1);
    const change = trend * (0.5 + Math.random()) + (Math.random() - 0.5) * lastPrice * 0.03;
    let newPrice = lastPrice + change;

    if (i === 0) {
      newPrice = currentPrice;
    }
    
    const open = lastPrice;
    const close = newPrice;
    // More realistic wick generation
    const volatility = newPrice * 0.015; // 1.5% volatility for wicks
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    const isRising = close >= open;
    const volume = baseVolume * (1 + (Math.random() - 0.4)) * (1 + Math.abs(close-open)/open * 5);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      wick: [parseFloat(low.toFixed(4)), parseFloat(high.toFixed(4))],
      bodyStart: parseFloat(Math.min(open, close).toFixed(4)),
      bodyHeight: parseFloat(Math.abs(open - close).toFixed(4)),
      isRising,
      volume: parseFloat(volume.toFixed(0)),
    });
    
    lastPrice = newPrice;
  }
  return data;
};

// Tooltip to show detailed data on hover
const CustomTooltip = ({ active, payload, label, chartType }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const priceData = payload.find(p => p.dataKey === 'close' || p.dataKey === 'bodyHeight');
    const volumeData = payload.find(p => p.dataKey === 'volume');

    if (!priceData) return null;

    return (
      <div className="p-2 text-xs rounded-md border bg-popover text-popover-foreground shadow-md">
        <p className="font-bold">{label}</p>
        {chartType === 'candlestick' && data.open ? (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
              <span className="text-muted-foreground">Open:</span>
              <span className="font-mono text-right text-foreground">${data.open.toLocaleString()}</span>
              <span className="text-muted-foreground">High:</span>
              <span className="font-mono text-right text-foreground">${data.high.toLocaleString()}</span>
              <span className="text-muted-foreground">Low:</span>
              <span className="font-mono text-right text-foreground">${data.low.toLocaleString()}</span>
              <span className="text-muted-foreground">Close:</span>
              <span className="font-mono text-right text-foreground">${data.close.toLocaleString()}</span>
          </div>
        ) : (
           <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
             <span className="text-muted-foreground">Price:</span>
             <span className="font-mono text-right text-foreground">${priceData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4})}</span>
           </div>
        )}
         {volumeData && (
           <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 border-t pt-1">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-mono text-right text-foreground">${volumeData.value.toLocaleString()}</span>
           </div>
         )}
      </div>
    );
  }
  return null;
};

// Supported time ranges for the chart
const timeRangeOptions = {
    "24H": { days: 1, description: "Last 24 hours" },
    "7D": { days: 7, description: "Last 7 days" },
    "1M": { days: 30, description: "Last 30 days" },
    "3M": { days: 90, description: "Last 3 months" },
    "1Y": { days: 365, description: "Last year" },
};
type TimeRangeKey = keyof typeof timeRangeOptions;

type ChartType = 'line' | 'candlestick';

export function PriceChart({ token }: { token: TokenDetails }) {
  const [chartData, setChartData] = React.useState<any[]>([])
  const [timeRange, setTimeRange] = React.useState<TimeRangeKey>("1M");
  const [chartType, setChartType] = React.useState<ChartType>("line");
  const [brushIndex, setBrushIndex] = React.useState({ startIndex: 0, endIndex: 0 });

  React.useEffect(() => {
    const data = generatePriceData(token.price, timeRangeOptions[timeRange].days);
    setChartData(data);
  }, [token.price, timeRange]);
  
  React.useEffect(() => {
    // When data changes, reset brush to show the full range
    if(chartData.length > 0) {
      setBrushIndex({ startIndex: 0, endIndex: chartData.length - 1 });
    }
  }, [chartData]);


  const chartConfig = {
    price: { color: "hsl(var(--chart-2))" },
    volume: { color: "hsl(var(--muted-foreground))" },
  }

  const yDomainPrice = React.useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    // Filter data based on brush range for accurate Y-axis scaling
    const visibleData = chartData.slice(brushIndex.startIndex, brushIndex.endIndex + 1);
    const prices = visibleData.flatMap(d => [d.high, d.low]);
    if (prices.length === 0) return ['auto', 'auto'];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData, brushIndex]);

  const yDomainVolume = React.useMemo(() => {
    if (chartData.length === 0) return [0, 'auto'];
    const visibleData = chartData.slice(brushIndex.startIndex, brushIndex.endIndex + 1);
    const volumes = visibleData.map(d => d.volume);
    if (volumes.length === 0) return [0, 'auto'];
    const max = Math.max(...volumes);
    return [0, max * 1.5]; // Give some headroom
  }, [chartData, brushIndex]);
  
  const description = `${timeRangeOptions[timeRange].description} price movement for ${token.symbol}.`;
  const syncId = "sync_chart";

  return (
    <Card>
      <CardHeader className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <CardTitle>{token.name} Price & Volume</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          </div>
          <div className="flex items-center gap-1">
            {(['line', 'candlestick'] as ChartType[]).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setChartType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
        <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ComposedChart 
                  data={chartData} 
                  syncId={syncId}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    orientation="right"
                    tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`}
                    domain={yDomainPrice}
                    allowDataOverflow
                  />
                  <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{strokeDasharray: '3 3'}}/>
                  
                  {chartType === 'line' ? (
                      <Area
                        dataKey="close"
                        type="monotone"
                        fill="hsl(var(--chart-2), 0.4)"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                  ) : (
                     <>
                        <Line dataKey="close" stroke="transparent" activeDot={false} isAnimationActive={false}>
                          <ErrorBar dataKey="wick" width={1.5} strokeWidth={1} stroke="hsl(var(--muted-foreground))" direction="y" />
                        </Line>
                        <Bar dataKey="bodyStart" stackId="candle" fill="transparent" isAnimationActive={false} />
                        <Bar dataKey="bodyHeight" stackId="candle" isAnimationActive={false} strokeWidth={1}>
                          {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.isRising ? 'transparent' : 'hsl(var(--destructive))'} 
                                stroke={entry.isRising ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                            />
                          ))}
                        </Bar>
                    </>
                  )}
                </ComposedChart>
            </ChartContainer>
            
            <ChartContainer config={chartConfig} className="h-[120px] w-full">
                 <ComposedChart 
                    data={chartData} 
                    syncId={syncId}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                 >
                    <CartesianGrid vertical={false} />
                     <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                     />
                     <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        orientation="right"
                        tickFormatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                        domain={yDomainVolume}
                        allowDataOverflow
                     />
                    <Tooltip content={<CustomTooltip chartType={chartType} />} cursor={{strokeDasharray: '3 3'}}/>
                    <Bar dataKey="volume" isAnimationActive={false}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isRising ? 'hsl(var(--chart-2), 0.5)' : 'hsl(var(--destructive), 0.5)'} />
                        ))}
                    </Bar>
                    <Brush 
                        dataKey="date" 
                        height={30} 
                        stroke="hsl(var(--primary))"
                        startIndex={brushIndex.startIndex}
                        endIndex={brushIndex.endIndex}
                        onChange={(e: any) => setBrushIndex({startIndex: e.startIndex, endIndex: e.endIndex})}
                    />
                 </ComposedChart>
            </ChartContainer>
        </>
        ) : (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[420px] w-full" />
            </div>
        )}
      </CardContent>
    </Card>
  )
}
