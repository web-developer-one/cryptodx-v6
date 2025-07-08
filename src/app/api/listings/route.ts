
import { getLatestListings } from '@/lib/coinmarketcap';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await getLatestListings();
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ data });
}
