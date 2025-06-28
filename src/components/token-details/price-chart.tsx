
'use client'

import * as React from "react"
import { Area, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Brush, Bar, Cell, Line, ErrorBar } from "recharts"
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

const generatePriceData = (currentPrice: number, days: number) => {
  const data = [];
  let lastPrice = currentPrice * (1 - (days / 365) * 0.4 - (Math.random() * 0.1)); // Start price lower for longer ranges
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Create a trend towards the current price
    const trend = (currentPrice - lastPrice) / (i + 1);
    const change = trend * (0.5 + Math.random()) + (Math.random() - 0.5) * lastPrice * 0.03;
    let newPrice = lastPrice + change;

    if (i === 0) {
      newPrice = currentPrice;
    }
    
    const open = lastPrice;
    const close = newPrice;
    const high = Math.max(open, close) + Math.abs(close - open) * Math.random();
    const low = Math.min(open, close) - Math.abs(close - open) * Math.random();
    
    const isRising = close >= open;

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
    });
    
    lastPrice = newPrice;
  }
  return data;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 text-xs rounded-md border bg-popover text-popover-foreground shadow-md">
        <p className="font-bold">{label}</p>
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

  React.useEffect(() => {
    setChartData(generatePriceData(token.price, timeRangeOptions[timeRange].days));
  }, [token.price, timeRange]);

  const chartConfig = {
    price: {
      color: "hsl(var(--chart-2))",
    },
  }

  const yDomain = React.useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
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
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          {chartData.length > 0 ? (
            <ComposedChart 
              data={chartData} 
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`}
                domain={yDomain}
                allowDataOverflow
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                dataKey="close"
                type="monotone"
                fill="url(#fillPrice)"
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
              <Line dataKey="close" stroke="transparent" activeDot={false} isAnimationActive={false}>
                <ErrorBar dataKey="wick" width={1.5} strokeWidth={1} stroke="hsl(var(--muted-foreground))" direction="y" />
              </Line>
              <Bar dataKey="bodyStart" stackId="candle" fill="transparent" isAnimationActive={false} />
              <Bar dataKey="bodyHeight" stackId="candle" isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isRising ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} />
                ))}
              </Bar>
              <Brush 
                dataKey="date" 
                height={30} 
                stroke="hsl(var(--primary))" 
                travellerWidth={20}
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
