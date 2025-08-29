

import { getLatestListings } from "@/lib/coinmarketcap";
import { HomePageClient } from "@/components/home-page-client";
import { redirect } from 'next/navigation';

export default async function Home() {
  // The root page now redirects to the Moralis swap page.
  // The content that was here has been moved to the Moralis page.
  redirect('/moralis');
}
