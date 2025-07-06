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
  // In Genkit 1.x, logLevel and enableTelemetry are configured differently
  // or are on by default if a telemetry plugin is provided.
  // The default behavior (no telemetry unless a plugin is added) is sufficient for this app.
});
