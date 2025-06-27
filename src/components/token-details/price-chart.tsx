
'use client'

import * as React from "react"
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from "recharts"
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

// Generate OHLC data for the candlestick chart
const generateCandlestickData = (currentPrice: number) => {
  const data = [];
  let lastClose = currentPrice * (1 - 0.1 - (Math.random() * 0.05)); // Start price ~15% lower 30 days ago

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const open = lastClose;
    // Simulate a price change, trending up towards the current price over 30 days
    const trend = (currentPrice - open) / (i + 1);
    const change = trend * (0.5 + Math.random()) + (Math.random() - 0.5) * open * 0.05;
    let close = open + change;

    // Ensure last day's close is current price
    if (i === 0) {
      close = currentPrice;
    }
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
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
  
  const fill = isGrowing ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
  
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-xs rounded-md border bg-popover text-popover-foreground shadow-md">
        <p className="font-bold">{data.date}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            <span className="text-muted-foreground">Open:</span><span className="font-mono text-right">${data.open.toLocaleString()}</span>
            <span className="text-muted-foreground">High:</span><span className="font-mono text-right">${data.high.toLocaleString()}</span>
            <span className="text-muted-foreground">Low:</span><span className="font-mono text-right">${data.low.toLocaleString()}</span>
            <span className="text-muted-foreground">Close:</span><span className="font-mono text-right">${data.close.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};


export function PriceChart({ token }: { token: TokenDetails }) {
  const [chartData, setChartData] = React.useState<any[]>([])
  const [timeRange, setTimeRange] = React.useState("1M");

  React.useEffect(() => {
    // Generate data on the client to avoid hydration mismatch
    // NOTE: This mock data generation is for "1M". In a real app,
    // this effect would re-fetch data when `timeRange` changes.
    setChartData(generateCandlestickData(token.price))
  }, [token.price])


  const chartConfig = {
    price: {
      label: "Price (USD)",
      color: "hsl(var(--primary))",
    },
  }

  // Find min and max for Y-axis domain to ensure candles are not clipped
  const yDomain = React.useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const lows = chartData.map(d => d.low);
    const highs = chartData.map(d => d.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{token.name} Price Chart</CardTitle>
          <CardDescription>
            Last 30 days price movement for {token.symbol}.
          </CardDescription>
        </div>
        <Button>Trade {token.symbol}</Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end gap-1 mb-4">
          {(["24H", "7D", "1M", "3M", "6M", "1Y"] as const).map((range) => (
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
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ComposedChart 
              data={chartData} 
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // Hide ticks on main chart when Brush is active
                tick={false}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`}
                domain={yDomain}
                allowDataOverflow
                orientation="right"
              />
              <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{
                      stroke: 'hsl(var(--border))',
                      strokeWidth: 1,
                      strokeDasharray: '3 3',
                  }}
              />
              {/* Wick */}
              <Bar
                dataKey={['low', 'high']}
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  if (!payload) return null;
                  const { open, close } = payload;
                  const isGrowing = close > open;
                  const stroke = isGrowing ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
                  return <rect x={x + (width / 2) - 0.5} y={y} width={1} height={height} fill={stroke} />;
                }}
              />
              {/* Body */}
              <Bar
                dataKey={['open', 'close']}
                barSize={10}
                shape={<CandleBody />}
              />
              <Brush 
                dataKey="date" 
                height={40} 
                stroke="hsl(var(--primary))" 
                travellerWidth={20}
                y={350}
              />
            </ComposedChart>
          ) : (
            <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[400px] w-full" />
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
