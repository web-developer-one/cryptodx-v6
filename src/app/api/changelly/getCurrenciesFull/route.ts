
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto-js';

const CHANGELLY_API_KEY = process.env.CHANGELLY_C2C_API_KEY;
const CHANGELLY_PRIVATE_KEY = process.env.CHANGELLY_C2C_PRIVATE_KEY;
const CHANGELLY_API_URL = 'https://api.changelly.com';

const formatPrivateKey = (key: string): string => {
    const formattedKey = key.replace(/\\n/g, '\n');
    if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    return formattedKey;
};


async function handler(req: NextRequest) {
  if (!CHANGELLY_API_KEY || !CHANGELLY_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Changelly C2C API credentials are not configured.' }, { status: 500 });
  }

  const message = await req.json();
  const sign = crypto.HmacSHA512(JSON.stringify(message), CHANGELLY_PRIVATE_KEY).toString(crypto.enc.Hex);

  try {
    const response = await fetch(`${CHANGELLY_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': CHANGELLY_API_KEY,
        'sign': sign,
      },
      body: JSON.stringify(message),
    });
    
    const responseText = await response.text();
    if (!responseText) {
        return NextResponse.json({ error: 'Empty response from Changelly API.' }, { status: response.status });
    }
    
    const data = JSON.parse(responseText);

    if (!response.ok || data.error) {
        return NextResponse.json({ error: data.error?.message || 'An error occurred with the Changelly API.' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Changelly proxy error:', error);
    return NextResponse.json({ error: 'Failed to communicate with the Changelly API.' }, { status: 500 });
  }
}

export { handler as POST };
