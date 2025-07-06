'use server';
/**
 * @fileOverview An AI agent that checks a cryptocurrency's reputation for scams or scandals.
 *
 * - checkTokenReputation - A function that checks the token's history.
 * - CheckTokenReputationInput - The input type for the checkTokenReputation function.
 * - CheckTokenReputationOutput - The return type for the checkTokenReputation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckTokenReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency. e.g., "Bitcoin"'),
  tokenSymbol: z.string().describe('The symbol of the cryptocurrency. e.g., "BTC"'),
});
export type CheckTokenReputationInput = z.infer<typeof CheckTokenReputationInputSchema>;

const CheckTokenReputationOutputSchema = z.object({
  isScamOrScandal: z
    .boolean()
    .describe('Whether the token has been involved in a widely reported scam, scandal, or other major negative event.'),
  reasoning: z
    .string()
    .describe('A brief, one-sentence summary of the negative event if one is found. Empty if no issues are found.'),
  sourceUrl: z.string().optional().describe('A URL to a credible news source or official report about the negative event. Empty if no source is found.'),
});
export type CheckTokenReputationOutput = z.infer<typeof CheckTokenReputationOutputSchema>;

export async function checkTokenReputation(
  input: CheckTokenReputationInput
): Promise<CheckTokenReputationOutput> {
  return checkTokenReputationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkTokenReputationPrompt',
  input: {schema: CheckTokenReputationInputSchema},
  output: {schema: CheckTokenReputationOutputSchema},
  prompt: `You are a cryptocurrency security analyst. Your task is to determine if a given cryptocurrency has been involved in any widely reported scams, scandals, rug pulls, or other significant negative events that would harm an investor.

Analyze the token based on the following information:
Token Name: {{{tokenName}}}
Token Symbol: {{{tokenSymbol}}}

Based on your knowledge of public information, news reports, and blockchain analysis, determine if this token has a history of major security issues or fraudulent activity.

If you find credible evidence of a major scandal or scam, set isScamOrScandal to true, provide a concise, one-sentence summary of the issue in the reasoning field, and include a URL to a credible source (like a news article or official report) in the sourceUrl field.
Example: "The token was part of a major rug pull event in [Year]." or "The project's founders were accused of embezzling funds."

If there is no significant evidence of scams or scandals, set isScamOrScandal to false and leave the reasoning and sourceUrl fields empty. Only flag tokens with significant, publicly known issues. Do not flag tokens for normal market volatility or minor community disputes.`,
  config: {
    temperature: 0.2, // Be factual and less creative
  }
});

const checkTokenReputationFlow = ai.defineFlow(
  {
    name: 'checkTokenReputationFlow',
    inputSchema: CheckTokenReputationInputSchema,
    outputSchema: CheckTokenReputationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (output) {
      return output;
    }
    // Fallback if the model doesn't return a valid output
    console.error('Reputation check flow failed to get a structured response from the model.');
    return {
      isScamOrScandal: false,
      reasoning: '',
      sourceUrl: undefined,
    };
  }
);
