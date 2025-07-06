'use server';
/**
 * @fileoverview This file initializes the Genkit AI and Google AI plugins.
 * It exports a single `ai` object that is used to define and run AI flows.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit and the Google AI plugin.
// This should be the only instance of `genkit()` in the app.
export const ai = genkit({
  plugins: [
    googleAI({
      // The Gemini 1.5 Flash model is a good balance of cost, speed, and quality.
      // Other models can be used here as well.
      // https://ai.google.dev/models/gemini
      // gemini-1.5-flash-latest is an auto-updating version
      model: 'gemini-1.5-flash-latest',
      // The embedding model is used for grounding and other tasks.
      embeddingModel: 'text-embedding-004',
    }),
  ],
  // Log all errors to the console.
  logLevel: 'error',
  // In a real app, you would want to enable telemetry to monitor your flows.
  // This requires a separate `genkit-telemetry` service to be running.
  // We disable it here for simplicity.
  enableTelemetry: false,
});
