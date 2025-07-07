
'use server';
/**
 * @fileOverview An AI flow to check the reputation of a cryptocurrency.
 *
 * - getReputationReport - A function that takes a token's name and symbol and returns a reputation analysis.
 * - ReputationInput - The input type for the getReputationReport function.
 * - ReputationOutput - The return type for the getReputationReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ReputationInputSchema = z.object({
  tokenName: z.string().describe("The full name of the cryptocurrency, e.g., 'Bitcoin'."),
  tokenSymbol: z.string().describe("The symbol or ticker of the cryptocurrency, e.g., 'BTC'."),
  language: z.string().describe("The language for the output, specified as a two-letter code, e.g., 'en', 'es', 'fr'.")
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

const ReputationOutputSchema = z.object({
  summary: z.string().describe("A one-paragraph summary of the token's overall reputation, including any major positive or negative points. This must be in the requested language."),
  sentiment: z.enum(['Positive', 'Neutral', 'Negative']).describe("The overall community sentiment towards the token."),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe("An estimated risk level associated with the token (Low, Medium, or High)."),
  findings: z.array(z.string()).describe("A list of 3-5 specific, bullet-point findings about the token. This can include information about recent news, common complaints, security audits, or positive developments. Each finding should be a complete sentence. This must be in the requested language."),
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

export async function getReputationReport(input: ReputationInput): Promise<ReputationOutput> {
  return reputationCheckFlow(input);
}

const reputationPrompt = ai.definePrompt({
  name: 'reputationPrompt',
  input: {schema: ReputationInputSchema},
  output: {schema: ReputationOutputSchema},
  prompt: `Act as a senior crypto security analyst. Your task is to provide a reputation report for the cryptocurrency: {{tokenName}} ({{tokenSymbol}}).

Analyze public information to identify potential risks, scams, rug pulls, or positive indicators. Your analysis should consider:
- General community sentiment on platforms like X (Twitter) and Reddit.
- Known security vulnerabilities or audits.
- Reports of scams or fraudulent activity associated with the token.
- The project's general trustworthiness and transparency.

Based on your analysis, provide a structured report with the following fields: summary, sentiment, riskLevel, and findings.

You MUST generate the entire response in the language specified by the code: {{language}}. Do not use Markdown in your response.`,
});

const reputationCheckFlow = ai.defineFlow(
  {
    name: 'reputationCheckFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    const {output} = await reputationPrompt(input);
    if (!output) {
      throw new Error("Failed to get a structured response from the AI model.");
    }
    return output;
  }
);
