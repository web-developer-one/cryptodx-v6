
'use server';

import {ai} from '@/ai/genkit';
import type {ReputationReport} from '@/lib/types';
import {z} from 'zod';

const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency token.'),
  language: z.string().describe('The language for the report (e.g., "English", "Spanish").'),
  enableAudio: z.boolean().describe('Whether to generate an audio version of the report summary.'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

const ReputationOutputSchema = z.object({
  report: z.object({
    status: z.enum(['clear', 'warning', 'critical']).describe('Overall reputation status.'),
    summary: z.string().describe('A brief one-sentence summary of the findings.'),
    findings: z.array(z.object({
      title: z.string().describe('A short title for the finding.'),
      description: z.string().describe('A detailed description of the potential issue.'),
      source: z.string().describe('The source of the information (e.g., "On-chain Analysis", "Social Media Scan").'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the finding.'),
    })).describe('A list of specific findings.'),
  }),
  audio: z.string().optional().describe('The audio report as a base64-encoded WAV data URI.'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

export async function getReputationReport(input: ReputationInput): Promise<ReputationOutput> {
  // This is a fallback implementation because the AI package is failing to install.
  // It throws an error which will be caught by the UI and displayed to the user.
  console.error("Reputation check disabled due to configuration issue.");
  throw new Error("The reputation check feature is currently unavailable due to a configuration issue.");
}
