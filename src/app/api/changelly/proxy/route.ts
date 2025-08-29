
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto-js';

const CHANGELLY_C2C_API_KEY = process.env.CHANGELLY_C2C_API_KEY;
const CHANGELLY_C2C_PRIVATE_KEY = process.env.CHANGELLY_C2C_PRIVATE_KEY;
const CHANGELLY_API_URL = 'https://api.changelly.com/v2';

// This is the definitive server-side proxy implementation for the C2C API.
// It receives the intended method and params from the client,
// signs the request securely on the server, and forwards it to Changelly.
async function handler(req: NextRequest) {
  if (!CHANGELLY_C2C_API_KEY || !CHANGELLY_C2C_PRIVATE_KEY) {
    console.error('Changelly C2C API credentials are not configured on the server.');
    return NextResponse.json({ error: { message: 'The API is not configured on the server.'} }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { method, params } = body;

    if (!method) {
        return NextResponse.json({ error: { message: 'API method is required.'} }, { status: 400 });
    }

    const message = {
        jsonrpc: '2.0',
        id: 'test',
        method: method,
        params: params || {},
    };
    
    const messageString = JSON.stringify(message);
    // Securely sign the request on the server using HMAC-SHA512 for the C2C API
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
        return NextResponse.json({ error: data.error || { message: 'An unknown error occurred with the Changelly API.'} }, { status: response.status || 500 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Changelly proxy internal error:', error);
    return NextResponse.json({ error: { message: 'Failed to communicate with the Changelly API.'} }, { status: 500 });
  }
}

export { handler as POST };

