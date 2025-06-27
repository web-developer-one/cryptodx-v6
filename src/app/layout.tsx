import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Swap",
  description: "Swap your favorite cryptocurrencies with ease and confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased flex flex-col",
          fontBody.variable
        )}
      >
        <Providers>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
