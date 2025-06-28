'use client'

import * as React from "react"
import { Area, Bar, CartesianGrid, Cell, ComposedChart, Line, ErrorBar, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import type { TokenDetails } from "@/lib/types"

// Generate mock OHLC data
const generatePriceData = (currentPrice: number, days: number) => {
  const data = [];
  let lastPrice = currentPrice * (1 - (Math.random() * 0.1)); // Start slightly lower
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Create a trend towards the current price
    const trend = (currentPrice - lastPrice) / (i + 1);
    const change = trend + (Math.random() - 0.5) * lastPrice * 0.05; // Add some volatility
    const newPrice = lastPrice + change;
    
    const open = lastPrice;
    const close = i === 0 ? currentPrice : newPrice; // Ensure final price is current price
    
    const high = Math.max(open, close) + Math.random() * (open - close) * 0.2;
    const low = Math.min(open, close) - Math.random() * (close - open) * 0.2;
    
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

// Tooltip to show detailed data on hover
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


export function PriceChart({ token }: { token: TokenDetails }) {
  const chartData = React.useMemo(() => {
    return generatePriceData(token.price, 30) // Generate 30 days of data
  }, [token.price])

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
    return [min - padding, max + padding];
  }, [chartData]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>{token.name} Price Chart</CardTitle>
        <CardDescription>30-day price movement for {token.symbol}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ComposedChart data={chartData}>
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
                tickFormatter={(value) => `$${Number(value).toLocaleString('en-US', {maximumFractionDigits: 2, minimumFractionDigits: 2})}`}
                domain={yDomain}
              />
              <Tooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3'}}/>
              
              <Area
                dataKey="close"
                type="monotone"
                fill="hsl(var(--chart-2), 0.4)"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />

              {/* Wicks */}
              <Line dataKey="close" stroke="transparent" activeDot={false}>
                 <ErrorBar dataKey="wick" width={1.5} strokeWidth={1.5} stroke="hsl(var(--muted-foreground))" direction="y" />
              </Line>

              {/* Candle Body */}
              <Bar dataKey="bodyStart" stackId="candle" fill="transparent" />
              <Bar dataKey="bodyHeight" stackId="candle">
                  {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isRising ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} />
                  ))}
              </Bar>

            </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
