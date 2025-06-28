
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Cryptocurrency } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TOKENS_PER_PAGE = 20;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
};

export function TokenExplorer({
  cryptocurrencies,
}: {
  cryptocurrencies: Cryptocurrency[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) {
      return cryptocurrencies;
    }
    return cryptocurrencies.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cryptocurrencies, searchQuery]);

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort(
      (a, b) => (a.cmcRank || Infinity) - (b.cmcRank || Infinity)
    );
  }, [filteredTokens]);

  const totalPages = Math.ceil(sortedTokens.length / TOKENS_PER_PAGE);

  const currentTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
    const endIndex = startIndex + TOKENS_PER_PAGE;
    return sortedTokens.slice(startIndex, endIndex);
  }, [sortedTokens, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRowClick = (tokenId: number) => {
    router.push(`/tokens/${tokenId}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Tokens</CardTitle>
          <div className="max-w-sm w-full">
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
              className="md:text-base"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTokens.map((token) => (
                <TableRow
                  key={token.id}
                  onClick={() => handleRowClick(token.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {token.cmcRank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={token.logo || `https://placehold.co/32x32.png`}
                        alt={`${token.name} logo`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold">{token.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.symbol}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatPrice(token.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={cn(
                        "font-medium flex items-center justify-end gap-1",
                        token.change24h >= 0
                          ? "text-primary"
                          : "text-destructive"
                      )}
                    >
                      {token.change24h >= 0 ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(token.change24h).toFixed(2)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between pt-6">
            <span className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * TOKENS_PER_PAGE) + 1} - {Math.min(currentPage * TOKENS_PER_PAGE, sortedTokens.length)} of {sortedTokens.length} tokens
            </span>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
