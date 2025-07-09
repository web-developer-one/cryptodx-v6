
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
  update: z
    .string()
    .describe('A short, single-sentence news-like update.'),
  sourceName: z
    .string()
    .describe("The name of the fictional news source (e.g., 'Crypto-Insights Daily')."),
  sourceUrl: z
    .string()
    .url()
    .describe('A plausible but fictional URL for the news source.'),
});
export type GenerateUpdateOutput = z.infer<typeof GenerateUpdateOutputSchema>;

export async function generateUpdate(): Promise<GenerateUpdateOutput> {
  return generateUpdateFlow();
}

const prompt = ai.definePrompt({
  name: 'generateUpdatePrompt',
  output: {schema: GenerateUpdateOutputSchema},
  model: 'googleai/gemini-pro',
  prompt: `You are an AI for a crypto application. Your task is to generate a single, short, engaging, news-style sentence, along with a fictional source name and URL.
  
The sentence should be about a plausible but fictional event or trend in one of the following domains: Blockchain, DeFi, Crypto, NFTs, or AI.

Keep it concise and under 15 words. Do not use quotation marks.

The source name should be a plausible name for a crypto news outlet.
The source URL should be a plausible, but completely fictional, .com URL that matches the source name.

Example outputs:
{
    "update": "A new cross-chain bridge protocol just launched with record-breaking transaction speeds.",
    "sourceName": "DeFi Pulse",
    "sourceUrl": "https://www.defipulse-news.com/articles/new-bridge-protocol"
}
{
    "update": "On-chain analytics reveal a major surge in NFT marketplace volume this week.",
    "sourceName": "NFT Analytics Today",
    "sourceUrl": "https://www.nftanalyticstoday.com/reports/market-surge-q3"
}

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
