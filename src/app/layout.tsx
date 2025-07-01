import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";
import { WalletProvider } from "@/hooks/use-wallet";
import { GdprModal } from "@/components/gdpr-modal";
import { getLatestListings } from "@/lib/coinmarketcap";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Swap",
  description: "Swap your favorite cryptocurrencies with ease and confidence.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cryptoData = await getLatestListings();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased flex flex-col",
          fontBody.variable
        )}
      >
        <WalletProvider>
          <Header cryptocurrencies={cryptoData} />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toaster />
          <GdprModal />
        </WalletProvider>
      </body>
    </html>
  );
}
