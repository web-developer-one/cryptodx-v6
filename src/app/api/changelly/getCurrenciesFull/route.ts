
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto-js';

const CHANGELLY_API_KEY = process.env.CHANGELLY_C2C_API_KEY;
const CHANGELLY_PRIVATE_KEY = process.env.CHANGELLY_C2C_PRIVATE_KEY;
const CHANGELLY_API_URL = 'https://api.changelly.com';

// Helper to format the PEM key from the environment variable
const formatPrivateKey = (key: string): string => {
    return key.replace(/\\n/g, '\n');
};

async function handler(req: NextRequest) {
  if (!CHANGELLY_API_KEY || !CHANGELLY_PRIVATE_KEY) {
    return NextResponse.json({ error: 'Changelly C2C API credentials are not configured.' }, { status: 500 });
  }

  const message = {
    id: "1",
    jsonrpc: "2.0",
    method: "getCurrenciesFull",
    params: {}
  };

  const privateKey = formatPrivateKey(CHANGELLY_PRIVATE_KEY);
  const sign = crypto.HmacSHA512(JSON.stringify(message), privateKey).toString(crypto.enc.Hex);

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
    
    const data = await response.json();

    if (!response.ok || data.error) {
        return NextResponse.json({ error: data.error?.message || 'An error occurred with the Changelly API.' }, { status: response.status || 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Changelly proxy error:', error);
    return NextResponse.json({ error: 'Failed to communicate with the Changelly API.' }, { status: 500 });
  }
}

export { handler as POST };
