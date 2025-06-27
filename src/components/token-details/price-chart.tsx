
'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import type { TokenDetails } from "@/lib/types"

const generateChartData = (currentPrice: number) => {
  const data = []
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Simulate some price volatility, trending towards the current price
    const randomFactor = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const trendFactor = (i/30) * 0.1; // The further back in time, the lower the price
    const price = currentPrice * (1 + randomFactor - trendFactor)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(price.toFixed(5)),
    })
  }
  return data
}

export function PriceChart({ token }: { token: TokenDetails }) {
  const chartData = generateChartData(token.price)

  const chartConfig = {
    price: {
      label: "Price (USD)",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{token.name} Price Chart</CardTitle>
        <CardDescription>
          Last 30 days price movement for {token.symbol}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
                content={<ChartTooltipContent indicator="dot" />} 
                cursor={{
                    stroke: 'hsl(var(--border))',
                    strokeWidth: 1,
                    strokeDasharray: '3 3',
                }}
            />
            <Area
              dataKey="price"
              type="natural"
              fill="url(#fillPrice)"
              stroke="var(--color-price)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
          <Button className="w-full text-lg h-12">Trade {token.symbol}</Button>
      </CardFooter>
    </Card>
  )
}
