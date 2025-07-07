
'use server';
/**
 * @fileOverview An AI flow for assessing the reputation of a cryptocurrency token.
 * This flow analyzes a token's name and symbol to identify potential risks.
 *
 * - getReputationReport: The main function to call to get a reputation report.
 * - ReputationInput: The Zod schema for the input.
 * - ReputationOutput: The Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the reputation flow.
const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency token.'),
  language: z.string().describe('The language code for the report (e.g., "en", "es").'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

// Define a very flexible output schema to prevent validation errors.
const ReputationOutputSchema = z.object({
  status: z
    .enum(['clear', 'warning', 'critical'])
    .describe('Overall reputation status.'),
  summary: z
    .string()
    .describe('A brief, one-sentence summary of the findings in the specified language.'),
  findings: z
    .array(
      z.object({
        title: z.string().optional().nullable().describe('A short, descriptive title for the finding.'),
        description: z
          .string()
          .optional()
          .nullable()
          .describe('A detailed, user-friendly description of the potential issue.'),
        source: z
          .string()
          .optional()
          .nullable()
          .describe('The source of the information (e.g., "On-chain Analysis", "Social Media Scan").'),
        severity: z.enum(['low', 'medium', 'high']).optional().nullable().describe('The severity of the finding.'),
        sourceUrl: z.string().url().optional().nullable().describe('A valid URL to a reputable source that backs up the finding.'),
      })
    )
    .optional()
    .describe('A list of specific findings. Return an empty array if the status is "clear".'),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

// Define the prompt for the reputation analysis.
const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  input: {
    schema: ReputationInputSchema,
  },
  output: {
    schema: ReputationOutputSchema,
  },
  system: `You are a cryptocurrency risk assessment AI. Your knowledge is based on information available up to your last training cut-off. You cannot access real-time data.

Your task is to analyze the provided token's name and symbol to identify potential red flags based on patterns commonly associated with high-risk or fraudulent tokens. Generate a risk report in the specified language.

Based on the token's name and symbol, evaluate the following:
- **Impersonation Risk**: Does the name or symbol appear to be impersonating a well-known, legitimate project? (e.g., "Ethereem", "Bitkoin")
- **"Meme Coin" Patterns**: Does the name follow patterns of highly speculative or "meme" coins which often have high risk? (e.g., names including "Safe", "Moon", "Elon", "Doge", "Shiba", or animal names).
- **Generic Naming**: Is the name overly generic?
- **Known Scams**: Does the name or symbol match any known scams, "rug pulls", or fraudulent projects from your training data?

Set the 'status' field:
- "clear": If no red flags are found. Summary should state that no obvious risks were found.
- "warning": If the name fits speculative patterns but is not a confirmed scam.
- "critical": If the name strongly suggests impersonation or matches a known scam.

Provide a one-sentence summary and a list of specific findings if any issues are detected. Do not provide a 'sourceUrl' unless you have a high-confidence, specific URL from your training data. A Google search link is not acceptable.`,
  prompt: `Language for report: {{{language}}}
Token to analyze:
Name: {{{tokenName}}}
Symbol: {{{tokenSymbol}}}`,
});

// Define the main Genkit flow for reputation checking.
const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    const { output } = await reputationPrompt(input);

    if (!output) {
      throw new Error('Failed to generate reputation report from the AI model.');
    }
    
    return output;
  }
);

// The exported wrapper function that the API route will interact with.
export async function getReputationReport(
  input: ReputationInput
): Promise<ReputationOutput> {
  return reputationFlow(input);
}
