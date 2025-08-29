
import { NextRequest, NextResponse } from 'next/server';

const CHANGELLY_API_URL = 'https://api.changelly.com';

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('api-key');
    const sign = req.headers.get('sign');

    if (!apiKey || !sign) {
      return NextResponse.json({ error: 'Missing API key or signature' }, { status: 401 });
    }

    const response = await fetch(CHANGELLY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'sign': sign,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Changelly proxy error:', error);
    return NextResponse.json({ error: 'Failed to communicate with the Changelly API.' }, { status: 500 });
  }
}

export { handler as POST };
