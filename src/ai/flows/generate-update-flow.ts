
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
  }),
});

const GenerateUpdateOutputSchema = z.object({
  update: z
    .string()
    .describe('A short, single-sentence news headline about the provided cryptocurrency from one of the specified sources.'),
  sourceName: z
    .string()
    .describe("The name of the news source (e.g., 'Cointelegraph', 'CoinDesk')."),
  sourceUrl: z
    .string()
    .url()
    .describe('The verifiable URL to the news article.'),
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
  prompt: `You are an expert crypto news aggregator. Your task is to find a recent, relevant, and real news headline for the cryptocurrency "{{coin.name}}" from ONE of the following reputable sources:

- CoinMarketCap
- Cointelegraph
- CoinDesk
- Bitcoin Magazine (bitcoinmagazine.com)
- CryptoMx (cryptomx.co)

Based on your knowledge and ability to find recent information, provide the following in JSON format:
1. "update": A short, compelling, single-sentence headline from the article.
2. "sourceName": The name of the website where the news is from (e.g., "Cointelegraph").
3. "sourceUrl": The full, real, and verifiable URL to the article.

If you cannot find a recent news article for "{{coin.name}}" from any of these specific sources, you MUST respond with a JSON object where the "update" field is "No recent news found for {{coin.name}}.", and the other fields are empty strings. Do not invent a source or URL.

Example of a good response:
{
  "update": "Bitcoin price holds steady above $68,000 as market awaits inflation data.",
  "sourceName": "Cointelegraph",
  "sourceUrl": "https://cointelegraph.com/news/bitcoin-price-holds-steady-above-68000"
}

Find a real headline for "{{coin.name}}" now.`,
});

const generateUpdateFlow = ai.defineFlow(
  {
    name: 'generateUpdateFlow',
    outputSchema: GenerateUpdateOutputSchema,
  },
  async () => {
    const fallbackResult = {
      update: 'Crypto markets are active, check the latest prices for top movers.',
      sourceName: 'CoinMarketCap',
      sourceUrl: 'https://coinmarketcap.com/headlines/news/',
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
          }
      });
      
      if (!output || !output.update || output.update.includes('No recent news found')) {
         console.warn(`AI prompt for live update returned no specific news for ${notableCoin.name}, using fallback.`);
         return fallbackResult;
      }
      
      return {
          update: output.update,
          sourceName: output.sourceName,
          sourceUrl: output.sourceUrl
      };

    } catch (error) {
      console.error("Error in generateUpdateFlow, returning fallback.", error);
      return fallbackResult;
    }
  }
);
