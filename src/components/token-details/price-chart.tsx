
'use client';

import { useMemo } from 'react';
import { Area, Bar, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import type { TokenDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Generate more realistic OHLC data for the chart
const generateChartData = (token: TokenDetails) => {
  const data = [];
  let currentPrice = token.price;
  // Use a smaller volatility factor for a more stable look
  const volatility = (token.change24h || 1) / 100 * 0.5;

  for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simulate price walk
    const open = currentPrice;
    
    // Bias the direction based on overall 24h change
    const trend = volatility / 30;
    const randomWalk = (Math.random() - 0.5) * 2 * (volatility / 2);
    const close = open * (1 + trend + randomWalk);
    
    const high = Math.max(open, close) * (1 + Math.random() * (volatility / 4));
    const low = Math.min(open, close) * (1 - Math.random() * (volatility / 4));

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: close,
      ohlc: [open, high, low, close],
    });
    
    currentPrice = close;
  }
  
  // Ensure the last data point is the current price and OHLC
  const lastOpen = data[data.length - 2]?.price || token.price * (1 - volatility);
  data[data.length - 1] = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: token.price,
      ohlc: [lastOpen, token.high24h || token.price * 1.02, token.low24h || token.price * 0.98, token.price],
  };

  return data;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // The payload can contain info from both Area and Bar. We look for ohlc.
    const ohlcPayload = payload.find(p => p.dataKey === 'ohlc');
    if (!ohlcPayload) return null;

    const [open, high, low, close] = ohlcPayload.payload.ohlc;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
        <p className="font-bold">{label}</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
            <span className="text-muted-foreground">Open:</span>
            <span className={`font-mono text-right`}>{open.toFixed(4)}</span>
            <span className="text-muted-foreground">High:</span>
            <span className={`font-mono text-right`}>{high.toFixed(4)}</span>
            <span className="text-muted-foreground">Low:</span>
            <span className={`font-mono text-right`}>{low.toFixed(4)}</span>
            <span className="text-muted-foreground">Close:</span>
            <span className={`font-mono text-right`}>{close.toFixed(4)}</span>
        </div>
      </div>
    );
  }
  return null;
};


const Candle = (props: any) => {
    const { x, y, width, height, low, high, fill, stroke } = props;
    const isUp = fill !== 'hsl(var(--destructive))';
    const bodyHeight = Math.max(height, 1); // Ensure body is at least 1px

    return (
        <g stroke={stroke} fill={isUp ? 'transparent' : fill} strokeWidth="1">
            {/* Wick */}
            <path d={`M ${x + width / 2} ${high} L ${x + width / 2} ${low}`} />
            {/* Body */}
            <rect x={x} y={y} width={width} height={bodyHeight} />
        </g>
    );
};

// This is a custom Bar component for recharts to render candlesticks.
// It maps the OHLC data to the necessary props for the Candle component.
const CandlestickBar = (props: any) => {
  const { x, ohlc } = props;
  const [open, high, low, close] = ohlc;
  
  // yAxis is inverted, so `y` is the top of the bar.
  // We need to calculate the correct y and height for the candle body.
  const isUp = close >= open;
  const y = isUp ? props.yAxis.scale(close) : props.yAxis.scale(open);
  const height = Math.abs(props.yAxis.scale(open) - props.yAxis.scale(close));
  
  const highCoord = props.yAxis.scale(high);
  const lowCoord = props.yAxis.scale(low);

  return (
      <Candle
          {...props}
          y={y}
          height={height}
          high={highCoord}
          low={lowCoord}
      />
  );
};


export function PriceChart({ token }: { token: TokenDetails }) {
  const chartData = useMemo(() => generateChartData(token), [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{token.name} Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="date" 
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                orientation="right" 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : ''}`}
                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                strokeWidth={2}
                dot={false}
            />
            
            <Bar dataKey="ohlc" shape={<CandlestickBar />} isAnimationActive={false}>
                 {chartData.map((entry, index) => {
                    const [open, , , close] = entry.ohlc;
                    const color = close >= open ? 'hsl(145 63% 49%)' : 'hsl(var(--destructive))';
                    return <Cell key={`cell-${index}`} fill={color} />;
                })}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
