
import { NextRequest, NextResponse } from 'next/server';
import { KJUR, hextob64 } from 'jsrsasign';

const CHANGELLY_C2C_API_KEY = process.env.CHANGELLY_C2C_API_KEY;
const CHANGELLY_C2C_PRIVATE_KEY = process.env.CHANGELLY_C2C_PRIVATE_KEY;
// The correct endpoint for the JSON-RPC 2.0 C2C API is the base URL.
const CHANGELLY_API_URL = 'https://api.changelly.com';

// Helper to format the PEM key from the environment variable
const formatPrivateKey = (key: string): string => {
    // Replace the placeholder for newlines with actual newline characters
    const formattedKey = key.replace(/\\n/g, '\n');
    // Ensure the key starts and ends with the correct headers
    if (!formattedKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
        return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    return formattedKey;
};


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

    // Correctly sign the request using RSA-SHA256 with the PEM private key
    const privateKey = formatPrivateKey(CHANGELLY_C2C_PRIVATE_KEY);
    const sig = new KJUR.crypto.Signature({ alg: 'SHA256withRSA' });
    sig.init(privateKey);
    sig.updateString(messageString);
    const signHex = sig.sign();
    const sign = hextob64(signHex);

    const response = await fetch(CHANGELLY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': CHANGELLY_C2C_API_KEY,
        'X-Api-Signature': sign,
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
