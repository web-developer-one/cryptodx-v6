
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto-js';

const CHANGELLY_API_KEY = process.env.CHANGELLY_API_KEY;
const CHANGELLY_PRIVATE_KEY = process.env.CHANGELLY_PRIVATE_KEY;
const CHANGELLY_API_URL = 'https://api.changelly.com/v2';

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/changelly', '');

  if (!CHANGELLY_API_KEY || !CHANGELLY_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Changelly API credentials are not configured.' }, { status: 500 });
  }

  const message = await req.json();
  const hmac = crypto.HmacSHA512(JSON.stringify(message), CHANGELLY_PRIVATE_KEY);
  const sign = hmac.toString(crypto.enc.Hex);

  try {
    const response = await fetch(`${CHANGELLY_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': CHANGELLY_API_KEY,
        'X-Api-Signature': sign,
      },
      body: JSON.stringify(message),
    });
    
    const data = await response.json();

    if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || 'An error occurred with the Changelly API.' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Changelly proxy error:', error);
    return NextResponse.json({ error: 'Failed to communicate with the Changelly API.' }, { status: 500 });
  }
}

export { handler as POST };
