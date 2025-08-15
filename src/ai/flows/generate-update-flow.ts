
'use server';
/**
 * @fileOverview A flow for generating a fake news update for the toast notification.
 *
 * - generateUpdate - A function that returns a short, engaging update sentence.
 * - GenerateUpdateOutput - The return type for the generateUpdate function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getLatestListings } from '@/lib/coinmarketcap';
import type { Cryptocurrency } from '@/lib/types';


const GenerateUpdateInputSchema = z.object({
  coin: z.object({
    name: z.string(),
    symbol: z.string(),
    change24h: z.number(),
    price: z.number(),
  }),
});

const GenerateUpdateOutputSchema = z.object({
  update: z
    .string()
    .describe('A short, single-sentence news-like update about the provided cryptocurrency.'),
  sourceName: z
    .string()
    .describe("The name of the real news source (e.g., 'CoinDesk', 'Cointelegraph')."),
  sourceUrl: z
    .string()
    .url()
    .describe('A real, verifiable URL for the news article from the source.'),
});
export type GenerateUpdateOutput = z.infer<typeof GenerateUpdateOutputSchema>;

export async function generateUpdate(): Promise<GenerateUpdateOutput> {
  return generateUpdateFlow();
}

const prompt = ai.definePrompt({
  name: 'generateUpdatePrompt',
  input: { schema: GenerateUpdateInputSchema },
  output: {schema: GenerateUpdateOutputSchema},
  model: 'googleai/gemini-pro',
  prompt: `You are an AI news aggregator for a crypto application. Your task is to generate a single, short, engaging, news-style sentence based on the real performance of a cryptocurrency.

The sentence should be about the following cryptocurrency:
- Name: {{{coin.name}}}
- Symbol: {{{coin.symbol}}}
- 24h Change: {{{coin.change24h}}}%
- Current Price: {{{coin.price}}} USD

Based on this data, search for a RECENT and REAL news article about this coin or a related market trend from a reputable cryptocurrency news source (like CoinDesk, Cointelegraph, Decrypt, The Block).

Generate a compelling, news-style sentence based on this data. Keep it concise and under 15 words. Do not use quotation marks.

Then, provide the REAL name of the news source and the REAL, verifiable URL to the article.

Example for a coin that is up:
{
    "update": "{{{coin.name}}} is surging, up {{{coin.change24h}}}% in the last 24 hours.",
    "sourceName": "Cointelegraph",
    "sourceUrl": "https://cointelegraph.com/news/bitcoin-price-hits-new-high"
}

Generate a new, unique update now based on the data for {{{coin.name}}}.`,
});

const generateUpdateFlow = ai.defineFlow(
  {
    name: 'generateUpdateFlow',
    outputSchema: GenerateUpdateOutputSchema,
  },
  async () => {
    const fallbackResult = {
      update: 'Crypto markets are active, check the latest prices for top movers.',
      sourceName: 'CryptoDx',
      sourceUrl: 'https://cryptodx-v7.netlify.app/',
    };

    try {
      const { data, error } = await getLatestListings();

      if (error || !data || data.length === 0) {
        console.warn('Could not fetch crypto listings for live update, using fallback.');
        return fallbackResult;
      }
      
      const sortedByChange = [...data].sort((a,b) => Math.abs(b.change24h) - Math.abs(a.change24h));
      const notableCoin: Cryptocurrency = sortedByChange[Math.floor(Math.random() * 5)]; // Pick one of the top 5 movers

      const { output } = await prompt({
          coin: {
              name: notableCoin.name,
              symbol: notableCoin.symbol,
              change24h: notableCoin.change24h,
              price: notableCoin.price,
          }
      });
      
      if (!output) {
         console.warn('AI prompt for live update returned no output, using fallback.');
         return fallbackResult;
      }

      return output;
    } catch (error) {
      console.error("Error in generateUpdateFlow, returning fallback.", error);
      return fallbackResult;
    }
  }
);