'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import type { Position } from '@/lib/types';
import { Badge } from './ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEffect, useState } from 'react';

const FormattedCurrency = ({ value }: { value: number }) => {
    const [formatted, setFormatted] = useState<string | null>(null);
    useEffect(() => {
        setFormatted(
             new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value)
        );
    }, [value]);
    return <>{formatted || null}</>;
};


export function PositionsTable({ positions }: { positions: Position[] }) {
    
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pool</TableHead>
                            <TableHead>Network</TableHead>
                            <TableHead className="text-right">Position Value</TableHead>
                            <TableHead className="text-right">APR (est.)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.map((position) => (
                            <TableRow key={position.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            <Image
                                                src={position.token0.logo || 'https://placehold.co/24x24.png'}
                                                alt={position.token0.name}
                                                width={24}
                                                height={24}
                                                className="rounded-full border-2 border-background"
                                            />
                                            <Image
                                                src={position.token1.logo || 'https://placehold.co/24x24.png'}
                                                alt={position.token1.name}
                                                width={24}
                                                height={24}
                                                className="rounded-full border-2 border-background"
                                            />
                                        </div>
                                        <span className="font-medium">{position.token0.symbol}/{position.token1.symbol}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{position.network}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    <FormattedCurrency value={position.value} />
                                </TableCell>
                                <TableCell className="text-right font-medium text-primary">{position.apr.toFixed(2)}%</TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Add Liquidity</DropdownMenuItem>
                                            <DropdownMenuItem>Remove Liquidity</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
