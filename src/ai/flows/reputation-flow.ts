
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const ReputationInputSchema = z.object({
  tokenName: z.string().describe('The name of the cryptocurrency token.'),
});
export type ReputationInput = z.infer<typeof ReputationInputSchema>;

export const ReputationOutputSchema = z.object({
    report: z.string().describe('A detailed reputation report for the token, formatted in Markdown.')
});
export type ReputationOutput = z.infer<typeof ReputationOutputSchema>;

export async function checkReputation(input: ReputationInput): Promise<ReputationOutput> {
  return reputationFlow(input);
}

const reputationPrompt = ai.definePrompt({
    name: 'reputationPrompt',
    input: { schema: ReputationInputSchema },
    output: { schema: ReputationOutputSchema },
    prompt: `
        Please perform a comprehensive reputation check for the cryptocurrency token: "{{tokenName}}".
        Scan through relevant internet platforms for real-time information. Your analysis should cover the following points:

        1.  **Social Media Sentiment:** Analyze recent discussions on platforms like X (formerly Twitter) and Reddit. What is the general sentiment (Positive, Negative, Neutral)? Are there any significant discussions, red flags, or positive endorsements from reputable sources?

        2.  **Developer Activity & Community:** Look for signs of active development (e.g., GitHub commits if available) and an engaged community. Is the project team transparent?

        3.  **Potential Red Flags:** Identify any common red flags such as accusations of being a scam, lack of communication from the team, or suspicious wallet activities if mentioned in public discussions.

        4.  **Overall Summary:** Provide a concise summary of your findings and a final reputation score from 1 to 10 (1 being very poor, 10 being excellent).

        Structure your response clearly with headings for each section. Use Markdown for formatting (e.g., **Heading** for bold headings).
    `,
});

const reputationFlow = ai.defineFlow(
  {
    name: 'reputationFlow',
    inputSchema: ReputationInputSchema,
    outputSchema: ReputationOutputSchema,
  },
  async (input) => {
    const { output } = await reputationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate reputation report.');
    }
    return output;
  }
);
