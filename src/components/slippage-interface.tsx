'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Cryptocurrency } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Slider } from '@/components/ui/slider';

const SIMULATED_POOL_BASE_LIQUIDITY = 500000; // $500k base liquidity for simulation

export function SlippageInterface({ cryptocurrencies }: { cryptocurrencies: Cryptocurrency[] }) {
  const [fromToken, setFromToken] = useState<Cryptocurrency>(cryptocurrencies[0]);
  const [toToken, setToToken] = useState<Cryptocurrency>(cryptocurrencies[1]);
  const [tradeAmount, setTradeAmount] = useState<string>('1000');
  const [liquidityMultiplier, setLiquidityMultiplier] = useState<number[]>([1]); // 1x = $500k, 10x = $5M etc.
  
  const handleTokenChange = (setter: React.Dispatch<React.SetStateAction<Cryptocurrency>>, otherToken: Cryptocurrency) => (symbol: string) => {
    const token = cryptocurrencies.find((t) => t.symbol === symbol);
    if (token) {
        if (token.symbol === otherToken.symbol) {
             if(setter.toString() === setFromToken.toString()) {
                setFromToken(toToken);
                setToToken(fromToken);
            } else {
                setToToken(fromToken);
                setFromToken(toToken);
            }
        } else {
            setter(token);
        }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setTradeAmount(value);
    }
  };

  const simulationResults = useMemo(() => {
    const amountIn = parseFloat(tradeAmount);
    if (isNaN(amountIn) || amountIn <= 0 || !fromToken || !toToken) {
      return { slippage: 0, priceImpact: 0, expectedOutput: 0, minReceived: 0 };
    }

    const tradeValueUSD = amountIn * fromToken.price;
    const simulatedLiquidity = SIMULATED_POOL_BASE_LIQUIDITY * liquidityMultiplier[0];

    // Simplified constant product formula simulation: (x * y = k)
    // This is a very basic model. Real AMMs are more complex.
    const priceImpact = (tradeValueUSD / (simulatedLiquidity + tradeValueUSD)) * 100;
    
    const exchangeRate = fromToken.price / toToken.price;
    const expectedOutput = amountIn * exchangeRate;
    
    // Slippage is the percentage of value lost due to price impact
    const actualRate = (fromToken.price * (1 - priceImpact / 100)) / toToken.price;
    const actualOutput = amountIn * actualRate;
    const minReceived = actualOutput;

    return {
        slippage: priceImpact, // Using price impact as a proxy for slippage
        priceImpact,
        expectedOutput,
        minReceived,
    };

  }, [tradeAmount, fromToken, toToken, liquidityMultiplier]);

  const chartData = useMemo(() => ([
    { 
        name: 'Output', 
        'Expected': simulationResults.expectedOutput, 
        'Guaranteed Minimum': simulationResults.minReceived 
    }
  ]), [simulationResults]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        {/* Settings Card */}
        <Card className="lg:col-span-1 shadow-lg">
            <CardHeader>
                <CardTitle>Simulation Settings</CardTitle>
                <CardDescription>Adjust parameters to see how they affect slippage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="from-token" className="text-sm">From Token</Label>
                    <Select value={fromToken.symbol} onValueChange={handleTokenChange(setFromToken, toToken)}>
                        <SelectTrigger id="from-token" className="mt-1">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                            {cryptocurrencies.map(t => <SelectItem key={t.id} value={t.symbol}>
                                <div className="flex items-center gap-2">
                                    <Image src={t.logo || 'https://placehold.co/20x20.png'} alt={t.name} width={20} height={20} className="rounded-full" />
                                    {t.name} ({t.symbol})
                                </div>
                            </SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="to-token" className="text-sm">To Token</Label>
                    <Select value={toToken.symbol} onValueChange={handleTokenChange(setToToken, fromToken)}>
                        <SelectTrigger id="to-token" className="mt-1">
                            <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                            {cryptocurrencies.map(t => <SelectItem key={t.id} value={t.symbol}>
                                <div className="flex items-center gap-2">
                                    <Image src={t.logo || 'https://placehold.co/20x20.png'} alt={t.name} width={20} height={20} className="rounded-full" />
                                    {t.name} ({t.symbol})
                                </div>
                            </SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="trade-amount" className="text-sm">Trade Amount (in {fromToken.symbol})</Label>
                    <Input id="trade-amount" value={tradeAmount} onChange={handleAmountChange} className="mt-1" />
                </div>
                
                <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="liquidity" className="text-sm flex items-center gap-1">
                            Simulated Pool Liquidity
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Simulates the total value locked (TVL) in the liquidity pool.<br/> Higher liquidity generally results in lower slippage.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Label>
                        <span className="text-sm font-medium">${(SIMULATED_POOL_BASE_LIQUIDITY * liquidityMultiplier[0]).toLocaleString()}</span>
                    </div>
                     <Slider
                        defaultValue={[1]}
                        value={liquidityMultiplier}
                        onValueChange={setLiquidityMultiplier}
                        min={0.1}
                        max={20}
                        step={0.1}
                        className="mt-2"
                    />
                     <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Shallow</span>
                        <span>Deep</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
                <CardTitle>Slippage Simulation Results</CardTitle>
                <CardDescription>Based on your settings, here is the estimated slippage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Price Impact</p>
                        <p className="text-2xl font-bold text-destructive">{simulationResults.priceImpact.toFixed(4)}%</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Expected Output</p>
                        <p className="text-2xl font-bold">{simulationResults.expectedOutput.toLocaleString('en-US', {maximumFractionDigits: 4})} {toToken.symbol}</p>
                    </div>
                     <div className="p-4 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Min. Received</p>
                        <p className="text-2xl font-bold">{simulationResults.minReceived.toLocaleString('en-US', {maximumFractionDigits: 4})} {toToken.symbol}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-center">Output Comparison</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                            <YAxis 
                                tickFormatter={(value) => value.toLocaleString()}
                                tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}}
                                width={80}
                            />
                            <RechartsTooltip 
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))'
                                }}
                                 formatter={(value: number) => [`${value.toLocaleString('en-US', {maximumFractionDigits: 4})} ${toToken.symbol}`]}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Bar dataKey="Expected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Guaranteed Minimum" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
