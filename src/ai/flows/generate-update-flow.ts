
'use server';
/**
 * @fileOverview A flow for generating a fake news update for the toast notification.
 *
 * - generateUpdate - A function that returns a short, engaging update sentence.
 * - GenerateUpdateOutput - The return type for the generateUpdate function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateUpdateOutputSchema = z.object({
  update: z.string().describe("A short, single-sentence news-like update."),
});
export type GenerateUpdateOutput = z.infer<typeof GenerateUpdateOutputSchema>;

export async function generateUpdate(): Promise<GenerateUpdateOutput> {
  return generateUpdateFlow();
}

const prompt = ai.definePrompt({
  name: 'generateUpdatePrompt',
  output: {schema: GenerateUpdateOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI for a crypto application. Your task is to generate a single, short, engaging, news-style sentence.
  
The sentence should be about a plausible but fictional event or trend in one of the following domains: Blockchain, DeFi, Crypto, NFTs, or AI.

Keep it concise and under 15 words. Do not use quotation marks.

Example outputs:
- A new cross-chain bridge protocol just launched with record-breaking transaction speeds.
- On-chain analytics reveal a major surge in NFT marketplace volume this week.
- A breakthrough in zero-knowledge proofs could soon make private DeFi transactions a reality.
- The latest AI model shows promise in predicting crypto market volatility with high accuracy.

Generate a new, unique update now.`,
});

const generateUpdateFlow = ai.defineFlow(
  {
    name: 'generateUpdateFlow',
    outputSchema: GenerateUpdateOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
