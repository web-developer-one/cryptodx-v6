
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto-js';

const CHANGELLY_C2C_API_KEY = process.env.CHANGELLY_C2C_API_KEY;
const CHANGELLY_C2C_PRIVATE_KEY = process.env.CHANGELLY_C2C_PRIVATE_KEY;
const CHANGELLY_API_URL = 'https://api.changelly.com';

// This is a dedicated proxy for the getPairsFull method to keep it simple.
async function handler(req: NextRequest) {
  if (!CHANGELLY_C2C_API_KEY || !CHANGELLY_C2C_PRIVATE_KEY) {
    console.error('Changelly C2C API credentials are not configured on the server.');
    return NextResponse.json({ error: 'The API is not configured on the server.' }, { status: 500 });
  }

  try {
    const message = {
        jsonrpc: '2.0',
        id: 'test',
        method: 'getCurrenciesFull',
        params: {},
    };
    
    const messageString = JSON.stringify(message);
    const sign = crypto.HmacSHA512(messageString, CHANGELLY_C2C_PRIVATE_KEY).toString(crypto.enc.Hex);

    const response = await fetch(CHANGELLY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': CHANGELLY_C2C_API_KEY,
        'sign': sign,
      },
      body: messageString,
    });
    
    const data = await response.json();

    if (!response.ok || data.error) {
        console.error('Changelly API Error:', data.error);
        return NextResponse.json({ error: data.error?.message || 'An unknown error occurred with the Changelly API.' }, { status: response.status || 500 });
    }

    return NextResponse.json(data.result);

  } catch (error) {
    console.error('Changelly getPairs proxy internal error:', error);
    return NextResponse.json({ error: 'Failed to communicate with the Changelly API.' }, { status: 500 });
  }
}

export { handler as GET };
