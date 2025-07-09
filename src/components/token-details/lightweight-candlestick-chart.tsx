
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

    // Function to get CSS variable values
    const getCssVariable = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    // Theme colors
    const backgroundColor = `hsl(${getCssVariable('--card')})`;
    const textColor = `hsl(${getCssVariable('--card-foreground')})`;
    const gridColor = `hsl(${getCssVariable('--border')})`;
    const upColor = `hsl(${getCssVariable('--success')})`;
    const downColor = `hsl(${getCssVariable('--destructive')})`;


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
