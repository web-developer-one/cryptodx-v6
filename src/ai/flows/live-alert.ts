'use server';
/**
 * @fileOverview An AI agent that generates real-time alerts for important events.
 *
 * - checkForAlerts - A function that checks for and returns a new alert.
 * - LiveAlertOutput - The return type for the checkForAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LiveAlertOutputSchema = z.object({
  hasAlert: z.boolean().describe('Whether a new, important alert was found.'),
  title: z.string().describe('The title of the alert. e.g., "DeFi Protocol Alert"'),
  message: z
    .string()
    .describe('A short, important, time-sensitive alert message.'),
  sourceUrl: z.string().optional().describe('A URL to a credible news source or official announcement about the event. If no source is available, this field can be omitted.'),
});
export type LiveAlertOutput = z.infer<typeof LiveAlertOutputSchema>;

export async function checkForAlerts(): Promise<LiveAlertOutput> {
  return liveAlertFlow();
}

const prompt = ai.definePrompt({
  name: 'liveAlertPrompt',
  output: {schema: LiveAlertOutputSchema},
  prompt: `You are a real-time market and security analyst for the web3 and AI space.
Your task is to generate a single, important, time-sensitive alert about a significant event that has just happened or is currently unfolding.
The event must be related to one of the following topics: "Blockchain", "DeFi", "Crypto", "NFT", or "AI". To ensure varied coverage, try to select an event from a different topic than you might have chosen previously.
The alert should be concise and impactful.

If you find a new, significant event, set hasAlert to true and provide a title, message, and a sourceUrl pointing to a credible news article or official announcement.
The title should categorize the alert (e.g., "DeFi Security Alert", "Major Crypto Rally", "AI Breakthrough").
The message should be a single sentence summarizing the event.
The sourceUrl must be a valid, live URL. If no credible source can be found, omit the sourceUrl field.

If there are no new, major, breaking events right now, set hasAlert to false and return empty strings for the title and message.
Do not invent events. Base your response on real, very recent information.
`,
   config: {
    temperature: 0.8, // Allow for some creativity in phrasing but stick to facts.
  },
});

const liveAlertFlow = ai.defineFlow(
  {
    name: 'liveAlertFlow',
    outputSchema: LiveAlertOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
