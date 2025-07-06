'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-ai';

// This is safe to run on the server.
// The API key is sourced from an environment variable.
const googleAiPlugin = googleAI({
  // To get an API key, visit:
  // https://makersuite.google.com/app/apikey
  apiKey: process.env.GOOGLE_API_KEY,
});

export const ai = genkit({
  plugins: [googleAiPlugin],
  // Omit logs in tests
  enableTracingAndMetrics: process.env.NODE_ENV !== 'test',
});
