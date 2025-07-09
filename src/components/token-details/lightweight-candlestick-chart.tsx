
'use client';

import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

// Define the shape of the data that the chart expects
interface CandlestickData {
  time: string; // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LightweightCandlestickChartProps {
  data: CandlestickData[];
}

export const LightweightCandlestickChart: React.FC<LightweightCandlestickChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Helper function to get a comma-separated HSL string from a CSS variable
    const getHslColor = (variableName: string): string => {
        const hslValues = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        // The values are space-separated like "210 16% 87%".
        // The library needs comma-separated format like "hsl(210, 16%, 87%)".
        const [h, s, l] = hslValues.split(' ');
        return `hsl(${h}, ${s}, ${l})`;
    };

    // Theme colors
    const backgroundColor = getHslColor('--card');
    const textColor = getHslColor('--card-foreground');
    const gridColor = getHslColor('--border');
    const upColor = getHslColor('--success');
    const downColor = getHslColor('--destructive');


    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight, // Use container height
      timeScale: {
        borderColor: gridColor,
      },
      rightPriceScale: {
        borderColor: gridColor,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: upColor,
      downColor: downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
    });
    candlestickSeries.setData(data);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
