
'use client';

import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

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
  // State to track theme changes and trigger re-render
  const [theme, setTheme] = useState('light');

  // Effect to set initial theme and listen for changes
  useEffect(() => {
    // Check for theme on mount
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Observe changes to the class attribute of the <html> element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isDarkNow = document.documentElement.classList.contains('dark');
                setTheme(isDarkNow ? 'dark' : 'light');
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Define colors based on the current theme using reliable hex codes
    const chartColors = theme === 'dark' ? {
        backgroundColor: '#1E293B',
        textColor: '#F1F5F9',
        gridColor: '#334155',
        upColor: '#22C55E',
        downColor: '#EF4444'
    } : {
        backgroundColor: '#FFFFFF',
        textColor: '#0F172A',
        gridColor: '#E5E7EB',
        upColor: '#16A34A',
        downColor: '#DC2626'
    };

    // Clean up previous chart instance if it exists
    if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
    }

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: chartColors.backgroundColor },
        textColor: chartColors.textColor,
      },
      grid: {
        vertLines: { color: chartColors.gridColor },
        horzLines: { color: chartColors.gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        borderColor: chartColors.gridColor,
      },
      rightPriceScale: {
        borderColor: chartColors.gridColor,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: chartColors.upColor,
      downColor: chartColors.downColor,
      borderVisible: false,
      wickUpColor: chartColors.upColor,
      wickDownColor: chartColors.downColor,
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
  }, [data, theme]); // Re-run this effect if data or theme changes

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
