import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});


export const metadata: Metadata = {
  title: 'CryptoDx | Seamless Token Exchange',
  description: 'Swap, trade, and manage your cryptocurrency assets with ease on our decentralized exchange platform.',
  icons: {
    icon: '/Cdx-box-icon-none.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The lang prop will be set in the i18n layout
    <html suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
