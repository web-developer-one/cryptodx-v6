
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Cryptocurrency } from "@/lib/types";

const TOKENS_PER_PAGE = 20;

export function TokenExplorer({
  cryptocurrencies,
}: {
  cryptocurrencies: Cryptocurrency[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTokens = useMemo(() => {
    return cryptocurrencies.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cryptocurrencies, searchQuery]);

  const totalPages = Math.ceil(filteredTokens.length / TOKENS_PER_PAGE);

  const currentTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * TOKENS_PER_PAGE;
    const endIndex = startIndex + TOKENS_PER_PAGE;
    return filteredTokens.slice(startIndex, endIndex);
  }, [filteredTokens, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      <Input
        placeholder="Search tokens..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // Reset to first page on new search
        }}
        className="max-w-sm w-full md:text-base"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
        {currentTokens.map((token) => (
          <Link href={`/tokens/${token.id}`} key={token.id} className="block h-full">
            <Card
              className="hover:bg-accent/50 transition-colors cursor-pointer h-full"
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3 h-full">
                <Image
                  src={token.logo || `https://placehold.co/48x48.png`}
                  alt={`${token.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="text-center">
                  <p className="font-semibold truncate">{token.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {token.symbol}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  );
}
