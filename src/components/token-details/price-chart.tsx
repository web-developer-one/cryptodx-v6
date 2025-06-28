
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
const generateCandlestickData = (currentPrice: number, days: number) => {
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

        data.push({
            date: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            open: parseFloat(open.toFixed(4)),
            high: parseFloat(high.toFixed(4)),
            low: parseFloat(low.toFixed(4)),
            close: parseFloat(close.toFixed(4)),
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
  
  const fill = isGrowing ? 'hsl(145 63% 49%)' : 'hsl(var(--destructive))';
  
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
    // Generate data on the client to avoid hydration mismatch
    const days = timeRangeOptions[timeRange].days;
    setChartData(generateCandlestickData(token.price, days));
  }, [token.price, timeRange])


  const chartConfig = {
    price: {
      label: "Price (USD)",
      color: "hsl(145 63% 49%)",
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
  
  const description = `${timeRangeOptions[timeRange].description} price movement for ${token.symbol}.`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{token.name} Price Chart</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </div>
        <Button>Trade {token.symbol}</Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end gap-1 mb-4">
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
                  const stroke = isGrowing ? 'hsl(145 63% 49%)' : 'hsl(var(--destructive))';
                  return <rect x={x + (width / 2) - 0.5} y={y} width={1} height={height} fill={stroke} />;
                }}
                animationDuration={300}
              />
              {/* Body */}
              <Bar
                dataKey={(item) => [Math.min(item.open, item.close), Math.max(item.open, item.close)]}
                barSize={10}
                shape={<CandleBody />}
                animationDuration={300}
              />
              <Brush 
                key={timeRange}
                dataKey="date" 
                height={40} 
                stroke="hsl(var(--primary))" 
                travellerWidth={20}
                y={350}
                data={chartData}
                startIndex={Math.max(0, chartData.length - 30)}
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
